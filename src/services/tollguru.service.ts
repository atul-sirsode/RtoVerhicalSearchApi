import { proxyRequest } from "./proxy.service.js";
import { env } from "../config/env.js";
import type {
  TollGuruRequest,
  TollGuruResponse,
  TollGuruApiResponse,
} from "../types/tollguru.types.js";
import type { TollCalculationOptions } from "../types/toll-analysis.types.js";
import { TollAnalysisService } from "./toll-analysis.service.js";

const TOLLGURU_API_KEY = env.TOLLGURU_API_KEY;
const TOLLGURU_BASE_URL = env.TOLLGURU_BASE_URL;
const TOLLGURU_ENDPOINT = env.TOLLGURU_ENDPOINT;

enum TollType {
  Barrier = "barrier",
  DistBarrier = "distBarrier",
  TicketSystem1 = "ticketSystem1",
  TicketSystem2 = "ticketSystem2",
  TicketSystem3 = "ticketSystem3",
}
interface RouteInfo {
  routeName: string;
  distance: string;
  duration: string;
  fastagTotal: number;
  tollSegments: { name: string; amount: number }[];
}
interface Toll {
  type: string;
  name?: string;
  start?: {
    name?: string;
  };
  end?: {
    name?: string;
  };
}

export const getTollName = (toll: Toll) => {
  switch (toll.type) {
    case TollType.Barrier:
    case TollType.DistBarrier:
      return toll.name || "";
    case TollType.TicketSystem1:
    case TollType.TicketSystem2:
    case TollType.TicketSystem3: {
      const startName = toll.start?.name ?? "";
      const endName = toll.end?.name ?? "";

      if (startName && endName) {
        return `${startName} to ${endName}`;
      }

      if (startName || endName) {
        return startName || endName;
      }

      return toll.name || "";
    }
    default:
      return toll.name || "";
  }
};

export class TollGuruService {
  /**
   * Get toll information between origin and destination
   */
  async getTollInfo(
    request: TollGuruRequest,
    options?: {
      includeAnalysis?: boolean;
      analysisOptions?: TollCalculationOptions;
    },
  ): Promise<TollGuruApiResponse> {
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

      console.log("Calling TollGuru API with request:", {
        from: request.from.address,
        to: request.to.address,
        vehicle: request.vehicle.type,
        country: request.country,
      });

      // Make API call to TollGuru
      const response = await proxyRequest<TollGuruResponse>({
        url: `${TOLLGURU_BASE_URL}${TOLLGURU_ENDPOINT}`,
        method: "POST",
        data: request,
        headers: requestHeaders,
      });

      console.log("TollGuru API response status:", response.status);

      // Check if API call was successful
      if (!response || !response.status) {
        return {
          status: false,
          message: "Failed to get toll information from TollGuru API",
          statuscode: 500,
        };
      }

      // Process and format the response
      const processedResponse = this.processTollGuruResponse(response);

      const result: TollGuruApiResponse = {
        status: true,
        message: "Toll information retrieved successfully",
        data: processedResponse,
      };

      // Add analysis if requested
      if (options?.includeAnalysis) {
        const analysisData = await this.performAnalysis(
          processedResponse,
          request,
          options.analysisOptions,
        );
        result.analysis = analysisData;
      }

      return result;
    } catch (error) {
      console.error("Error in TollGuru service:", error);
      return {
        status: false,
        message: "Internal server error while processing toll information",
        statuscode: 500,
      };
    }
  }

  /**
   * Perform analysis on existing TollGuru response
   */
  async performAnalysis(
    tollGuruResponse: TollGuruResponse,
    request: TollGuruRequest,
    options: TollCalculationOptions = {
      includeFuelCost: true,
      includeCashCosts: true,
      calculateAverageSpeeds: true,
      formatTimeDisplay: true,
    },
  ): Promise<any> {
    try {
      const analysisService = new TollAnalysisService();

      // Create analysis request
      const analysisRequest = {
        from: request.from,
        to: request.to,
        vehicle: request.vehicle,
        country: request.country,
      };

      // Process the response to extract detailed toll analysis
      const analysisSummary = this.processTollGuruResponseForAnalysis(
        tollGuruResponse,
        analysisRequest,
        options,
      );

      // Get route comparison
      const routeComparison = analysisService.compareRoutes(analysisSummary);

      // Get toll statistics for recommended route
      const tollStatistics = analysisService.getTollStatistics(
        analysisSummary.recommendedRoute,
      );

      return {
        recommendedRoute: analysisSummary.recommendedRoute,
        alternativeRoutes: analysisSummary.alternativeRoutes,
        routeComparison,
        tollStatistics,
        analysisTimestamp: analysisSummary.analysisTimestamp,
      };
    } catch (error) {
      console.error("Error performing analysis:", error);
      return null;
    }
  }

  /**
   * Process TollGuru response for analysis (similar to TollAnalysisService)
   */
  private processTollGuruResponseForAnalysis(
    response: TollGuruResponse,
    request: any,
    options: TollCalculationOptions,
  ): any {
    // This is a simplified version - we'll use the TollAnalysisService logic
    const analysisService = new TollAnalysisService();

    // Create a mock analysis summary based on the response
    const routesWithTolls = response.routes.map((route, index) => {
      return this.processRouteForAnalysis(
        route,
        index,
        response.summary,
        options,
      );
    });

    const recommendedRoute = this.findRecommendedRoute(routesWithTolls);

    return {
      origin: request.from.address,
      destination: request.to.address,
      vehicleType: request.vehicle.type,
      currency: response.summary.currency,
      totalRoutes: response.routes.length,
      recommendedRoute,
      alternativeRoutes: routesWithTolls.filter((r) => r !== recommendedRoute),
      analysisTimestamp: new Date(),
    };
  }

  /**
   * Process individual route for analysis
   */
  private processRouteForAnalysis(
    route: any,
    routeIndex: number,
    summary: any,
    options: TollCalculationOptions,
  ): any {
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

        // Calculate first toll details using start and end arrival data
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
            segmentTime = (endTime.getTime() - startTime.getTime()) / 1000; // seconds
            if (segmentDistance > 0 && segmentTime > 0) {
              averageSpeed = segmentDistance / 1000 / (segmentTime / 3600); // km/h
            }
          }

          processedToll.tollSegmentDetails = {
            startDistance,
            endDistance,
            segmentDistance,
            startTime,
            endTime,
            segmentTime, // in seconds
            averageSpeed, // in km/h
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
    const totalCost =
      totalTollCost + (options.includeFuelCost ? totalFuelCost : 0);

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

    const etaInfo = this.calculateETA(
      durationSeconds,
      30, // min buffer
      60, // max buffer
      new Date(), // live start time
    );

    // Add ETA info to each toll
    tolls.forEach((toll, index) => {
      let estimatedArrivalTime = toll.estimatedArrivalTime;

      // For first toll or tolls without estimatedArrivalTime, use tollSegmentDetails
      if (!estimatedArrivalTime && toll.tollSegmentDetails) {
        // Use the end time of the segment as the arrival time for this toll
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

  /**
   * Process and format TollGuru response
   */
  private processTollGuruResponse(
    response: TollGuruResponse,
  ): TollGuruResponse {
    // Add any additional processing or transformation here if needed
    // For now, return the response as-is since it's already well-structured

    // You could add custom formatting, calculations, or filtering here
    const processedResponse = { ...response };

    // Example: Add computed fields if needed
    if (processedResponse.routes && processedResponse.routes.length > 0) {
      processedResponse.routes.forEach((route, index) => {
        // Add route index for easier reference
        (route as any).routeIndex = index + 1;

        // Calculate total cost including fuel and tolls
        if (route.costs) {
          (route as any).totalCostTag = route.costs.fuel + route.costs.tag;
          (route as any).totalCostCash = route.costs.fuel + route.costs.cash;
        }
      });
    }

    return processedResponse;
  }

  /**
   * Get supported vehicle types
   */
  getSupportedVehicleTypes(): string[] {
    return [
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
  }

  /**
   * Get vehicle description
   */
  getVehicleDescription(vehicleType: string): string {
    const descriptions: { [key: string]: string } = {
      "2AxlesAuto": "Car, Jeep, Van, SUV",
      "2AxlesMotorcycle": "Motorcycle",
      "3AxlesAuto": "3-Axle Vehicle",
      "3AxlesAutoPlusTrailer": "3-Axle Vehicle with Trailer",
      "4AxlesAuto": "4-Axle Vehicle",
      "4AxlesAutoPlusTrailer": "4-Axle Vehicle with Trailer",
      "5AxlesAuto": "5-Axle Vehicle",
      "5AxlesAutoPlusTrailer": "5-Axle Vehicle with Trailer",
      "6AxlesAuto": "6-Axle Vehicle",
      "6AxlesAutoPlusTrailer": "6-Axle Vehicle with Trailer",
      "7AxlesAuto": "7-Axle Vehicle",
      "7AxlesAutoPlusTrailer": "7-Axle Vehicle with Trailer",
      "8AxlesAuto": "8-Axle Vehicle",
      "8AxlesAutoPlusTrailer": "8-Axle Vehicle with Trailer",
    };

    return descriptions[vehicleType] || "Unknown Vehicle Type";
  }
}
