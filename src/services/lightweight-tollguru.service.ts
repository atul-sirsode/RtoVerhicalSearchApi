import { proxyRequest } from "./proxy.service.js";
import { env } from "../config/env.js";
import type {
  TollGuruRequest,
  TollGuruResponse,
} from "../types/tollguru.types.js";
import { getTollName } from "./tollguru.service.js";

const TOLLGURU_API_KEY = env.TOLLGURU_API_KEY;
const TOLLGURU_BASE_URL = env.TOLLGURU_BASE_URL;
const TOLLGURU_ENDPOINT = env.TOLLGURU_ENDPOINT;

interface LightweightTollGuruResponse {
  status: boolean;
  message: string;
  statuscode?: number;
  analysis?: {
    recommendedRoute?: any;
  };
}

export class LightweightTollGuruService {
  /**
   * Get toll details with only recommended route analysis
   */
  async getTollDetails(
    request: TollGuruRequest,
  ): Promise<LightweightTollGuruResponse> {
    try {
      // Validate request data
      const validationError = this.validateRequest(request);
      if (validationError) {
        return {
          status: false,
          message: validationError,
          statuscode: 400,
        };
      }

      // Prepare request headers
      const requestHeaders = {
        "Content-Type": "application/json",
        "x-api-key": TOLLGURU_API_KEY,
        Accept: "application/json",
      };

      // Add current departureTime if not provided
      const requestWithTime = {
        ...request,
        departureTime: request.departureTime || new Date().toISOString(),
      };

      console.log("Calling TollGuru API (Lightweight) with request:", {
        from: request.from.address,
        to: request.to.address,
        vehicle: request.vehicle.type,
        country: request.country,
        departureTime: requestWithTime.departureTime,
      });

      // Make API call to TollGuru
      const response = await proxyRequest<TollGuruResponse>({
        url: `${TOLLGURU_BASE_URL}${TOLLGURU_ENDPOINT}`,
        method: "POST",
        data: requestWithTime,
        headers: requestHeaders,
      });

      console.log(
        "TollGuru API (Lightweight) response status:",
        response.status,
      );

      // Check if API call was successful
      if (!response || !response.status) {
        return {
          status: false,
          message: "Failed to get toll information from TollGuru API",
          statuscode: 500,
        };
      }

      // Process and extract only recommended route
      const recommendedRoute = this.extractRecommendedRoute(response);

      return {
        status: true,
        message: "Toll details retrieved successfully",
        statuscode: 200,
        analysis: {
          recommendedRoute,
        },
      };
    } catch (error) {
      console.error("Error in Lightweight TollGuru service:", error);
      return {
        status: false,
        message: "Internal server error while processing toll information",
        statuscode: 500,
      };
    }
  }

  /**
   * Extract and process only the recommended route from TollGuru response
   */
  private extractRecommendedRoute(response: TollGuruResponse): any {
    const routesWithAnalysis = response.routes.map((route, index) => {
      return this.processRoute(route, index);
    });

    // Find recommended route based on criteria
    return this.findRecommendedRoute(routesWithAnalysis);
  }

  /**
   * Process individual route
   */
  private processRoute(route: any, routeIndex: number): any {
    const tolls: any[] = [];

    // Extract toll information
    if (route.tolls && Array.isArray(route.tolls)) {
      route.tolls.forEach((toll: any, index: number) => {
        const processedToll: any = {
          name: getTollName(toll),
          tagCost: toll.tagCost || toll.cost || 0,
          cashCost: toll.cashCost,
          arrival: toll.arrival,
          location: toll.location,
          id: toll.id,
          type: toll.type,
          road: toll.road,
        };

        // Calculate toll segment details
        if (toll.start?.arrival && toll.end?.arrival) {
          const startDistance = toll.start.arrival.distance || 0;
          const endDistance = toll.end.arrival.distance || 0;
          const segmentDistance = endDistance - startDistance;

          const startTime = toll.start.arrival.time
            ? new Date(toll.start.arrival.time)
            : null;
          const endTime = toll.end.arrival.time
            ? new Date(toll.end.arrival.time)
            : null;

          let segmentTime = 0;
          let averageSpeed = 0;

          if (startTime && endTime) {
            segmentTime = (endTime.getTime() - startTime.getTime()) / 1000;
            if (segmentDistance > 0 && segmentTime > 0) {
              averageSpeed = segmentDistance / 1000 / (segmentTime / 3600);
            }
          }

          processedToll.tollSegmentDetails = {
            startDistance,
            endDistance,
            segmentDistance,
            startTime,
            endTime,
            segmentTime,
            averageSpeed,
            formattedSegmentTime:
              segmentTime > 0 ? this.formatDuration(segmentTime) : "",
          };
        }

        if (toll.arrival && toll.arrival.time) {
          processedToll.estimatedArrivalTime = new Date(toll.arrival.time);
        }

        tolls.push(processedToll);
      });
    }

    // Calculate totals
    const totalTollCost = tolls.reduce((sum, toll) => sum + toll.tagCost, 0);
    const totalFuelCost = route.costs?.fuel || 0;
    const totalCost = totalTollCost + totalFuelCost;

    // Check route criteria
    const labels = route.summary?.labels || [];
    const hasPractical = labels.includes("practical");
    const hasCheapest = labels.includes("cheapest");
    const hasFastest = labels.includes("fastest");
    const labelCount = [hasPractical, hasCheapest, hasFastest].filter(
      Boolean,
    ).length;
    const meetsCriteria = labelCount >= 2 || hasPractical;
    const durationSeconds = route.summary?.duration?.value || 0;

    const etaInfo = this.calculateETA(durationSeconds, 30, 60, new Date());

    // Add ETA info to each toll
    tolls.forEach((toll, index) => {
      let estimatedArrivalTime = toll.estimatedArrivalTime;

      if (!estimatedArrivalTime && toll.tollSegmentDetails) {
        estimatedArrivalTime = toll.tollSegmentDetails.endTime;
      }

      toll.etaInfo = {
        sequence: index + 1,
        estimatedArrival: estimatedArrivalTime,
        timeFromStart: estimatedArrivalTime
          ? (estimatedArrivalTime.getTime() - etaInfo.startTime.getTime()) /
            1000
          : 0,
        formattedArrivalTime: estimatedArrivalTime
          ? estimatedArrivalTime.toLocaleString()
          : "",
      };
    });

    return {
      routeIndex,
      routeName: route.summary?.name || `Route ${routeIndex + 1}`,
      totalTolls: tolls.length,
      totalTollCost,
      totalFuelCost,
      totalCost,
      duration: route.summary?.duration || { text: "", value: 0 },
      distance: route.summary?.distance || { text: "", value: 0 },
      labels,
      meetsCriteria,
      estimatedArrivalTime: new Date(
        Date.now() + (route.summary?.duration?.value || 0) * 1000,
      ),
      etaInfo,
      tolls,
      tollSequence: tolls.map((toll, index) => ({
        sequence: index + 1,
        name: toll.name,
        cost: toll.tagCost,
        type: toll.type,
      })),
      routeInfo: {
        routeName: route.summary?.name || `Route ${routeIndex + 1}`,
        distance: route.summary?.distance?.metric || "",
        duration: route.summary?.duration?.text || "",
        fastagTotal: totalTollCost,
        tollSegments: tolls.map((toll) => ({
          name: getTollName(toll),
          amount: toll.tagCost,
        })),
      },
    };
  }

  /**
   * Calculate estimated time of arrival (ETA)
   */
  private calculateETA(
    durationSeconds: number,
    bufferMinMinutes = 30,
    bufferMaxMinutes = 60,
    startTime?: Date,
  ) {
    const start = startTime ?? new Date();

    const baseDurationMs = durationSeconds * 1000;
    const minBufferMs = bufferMinMinutes * 60 * 1000;
    const maxBufferMs = bufferMaxMinutes * 60 * 1000;

    const baseEta = new Date(start.getTime() + baseDurationMs);
    const etaWithMinBuffer = new Date(baseEta.getTime() + minBufferMs);
    const etaWithMaxBuffer = new Date(baseEta.getTime() + maxBufferMs);

    return {
      startTime: start,
      baseDurationMs,
      baseDurationMinutes: Math.floor(durationSeconds / 60),
      baseEta,
      etaWithMinBuffer,
      etaWithMaxBuffer,
      processingWindowMinutes: {
        min: bufferMinMinutes,
        max: bufferMaxMinutes,
      },
      totalProcessingTimeMs: baseDurationMs + minBufferMs,
    };
  }

  /**
   * Format duration in seconds to human-readable format
   */
  private formatDuration(seconds: number): string {
    if (seconds <= 0) return "0 seconds";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    if (remainingSeconds > 0 || parts.length === 0)
      parts.push(
        `${remainingSeconds} second${remainingSeconds !== 1 ? "s" : ""}`,
      );

    return parts.join(" ");
  }

  /**
   * Find recommended route
   */
  private findRecommendedRoute(routes: any[]): any {
    const routesMeetingCriteria = routes.filter((r) => r.meetsCriteria);

    if (routesMeetingCriteria.length > 0) {
      const practicalRoutes = routesMeetingCriteria.filter((r) =>
        r.labels.includes("practical"),
      );
      return practicalRoutes.length > 0
        ? practicalRoutes[0]
        : routesMeetingCriteria[0];
    }

    return routes.reduce((cheapest, current) =>
      current.totalCost < cheapest.totalCost ? current : cheapest,
    );
  }

  /**
   * Validate the request data
   */
  private validateRequest(request: TollGuruRequest): string | null {
    if (!request.from?.address) {
      return "Origin address is required";
    }

    if (!request.to?.address) {
      return "Destination address is required";
    }

    if (!request.vehicle?.type) {
      return "Vehicle type is required";
    }

    if (!request.country) {
      return "Country is required";
    }

    // Validate vehicle type
    const validVehicleTypes = [
      "2AxlesAuto",
      "2AxlesMotorcycle",
      "3AxlesAuto",
      "3AxlesAutoPlusTrailer",
      "4AxlesAuto",
      "4AxlesAutoPlusTrailer",
      "5AxlesAuto",
      "5AxlesAutoPlusTrailer",
      "6AxlesAuto",
      "6AxlesAutoPlusTrailer",
      "7AxlesAuto",
      "7AxlesAutoPlusTrailer",
      "8AxlesAuto",
      "8AxlesAutoPlusTrailer",
    ];

    if (!validVehicleTypes.includes(request.vehicle.type)) {
      return `Invalid vehicle type. Valid types are: ${validVehicleTypes.join(", ")}`;
    }

    // Validate country code (should be 3 letters)
    if (!/^[A-Z]{3}$/.test(request.country)) {
      return "Country must be a 3-letter ISO code (e.g., IND, USA)";
    }

    return null;
  }
}
