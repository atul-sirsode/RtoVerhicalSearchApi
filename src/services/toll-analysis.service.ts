import { TollGuruService } from "./tollguru.service.js";
import type {
  TollGuruRequest,
  TollGuruResponse,
} from "../types/tollguru.types.js";
import type {
  TollGuruToll,
  TollGuruRouteTolls,
  TollSequenceAnalysis,
  TollAnalysisSummary,
  TollComparisonResult,
  EnhancedTollGuruRequest,
  EnhancedTollGuruResponse,
  TollCalculationOptions,
} from "../types/toll-analysis.types.js";

export class TollAnalysisService {
  private tollGuruService: TollGuruService;

  constructor() {
    this.tollGuruService = new TollGuruService();
  }

  /**
   * Get comprehensive toll analysis with arrival time calculations
   */
  async getTollAnalysis(
    request: EnhancedTollGuruRequest,
    options: TollCalculationOptions = {
      includeFuelCost: true,
      includeCashCosts: true,
      calculateAverageSpeeds: true,
      formatTimeDisplay: true,
    },
  ): Promise<EnhancedTollGuruResponse> {
    try {
      // Get basic toll information from TollGuru
      const basicRequest: TollGuruRequest = {
        from: request.from,
        to: request.to,
        vehicle: request.vehicle,
        country: request.country,
      };

      const tollGuruResponse =
        await this.tollGuruService.getTollInfo(basicRequest);

      if (!tollGuruResponse.status || !tollGuruResponse.data) {
        return {
          status: false,
          message: tollGuruResponse.message,
          statuscode: tollGuruResponse.statuscode || 500,
        };
      }

      // Process the response to extract detailed toll analysis
      const analysisSummary = this.processTollGuruResponse(
        tollGuruResponse.data,
        request,
        options,
      );

      return {
        status: true,
        message: "Toll analysis completed successfully",
        data: analysisSummary,
      };
    } catch (error) {
      console.error("Error in TollAnalysis service:", error);
      return {
        status: false,
        message: "Internal server error while processing toll analysis",
        statuscode: 500,
      };
    }
  }

  /**
   * Process TollGuru response to extract detailed toll analysis
   */
  private processTollGuruResponse(
    response: TollGuruResponse,
    request: EnhancedTollGuruRequest,
    options: TollCalculationOptions,
  ): TollAnalysisSummary {
    const routesWithTolls: TollGuruRouteTolls[] = [];

    response.routes.forEach((route, index) => {
      const routeWithTolls = this.processRouteWithTolls(
        route,
        index,
        response.summary,
        request,
        options,
      );
      routesWithTolls.push(routeWithTolls);
    });

    // Find recommended route (meets criteria: practical + 2 out of 3 labels)
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
   * Process individual route to extract toll details and calculate arrival times
   */
  private processRouteWithTolls(
    route: any,
    routeIndex: number,
    summary: any,
    request: EnhancedTollGuruRequest,
    options: TollCalculationOptions,
  ): TollGuruRouteTolls {
    const tolls: TollGuruToll[] = [];
    const tollSequence: TollSequenceAnalysis[] = [];

    // Extract toll information from the route
    if (route.tolls && Array.isArray(route.tolls)) {
      route.tolls.forEach((toll: any, index: number) => {
        const processedToll: TollGuruToll = {
          name: toll.name || `Toll ${index + 1}`,
          tagCost: toll.tagCost || toll.cost || 0,
          cashCost: toll.cashCost,
          arrival: toll.arrival,
          location: toll.location,
          id: toll.id,
          type: toll.type,
          road: toll.road,
        };

        // Calculate estimated arrival time
        if (toll.arrival && toll.arrival.time) {
          processedToll.estimatedArrivalTime = new Date(toll.arrival.time);
        }

        tolls.push(processedToll);
      });
    }

    // Calculate toll sequence analysis
    if (tolls.length > 0) {
      const journeyStartTime = new Date();

      tolls.forEach((toll, index) => {
        const timeFromStart = toll.estimatedArrivalTime
          ? (toll.estimatedArrivalTime.getTime() - journeyStartTime.getTime()) /
            1000
          : 0;

        const timeFromPreviousToll =
          index > 0 &&
          tolls[index - 1]?.estimatedArrivalTime &&
          toll.estimatedArrivalTime
            ? (toll.estimatedArrivalTime.getTime() -
                tolls[index - 1]!.estimatedArrivalTime!.getTime()) /
              1000
            : 0;

        const distanceFromStart = this.calculateDistanceFromStart(route, index);
        const distanceFromPreviousToll =
          index > 0
            ? distanceFromStart -
              this.calculateDistanceFromStart(route, index - 1)
            : 0;

        const averageSpeedBetweenTolls =
          timeFromPreviousToll > 0
            ? distanceFromPreviousToll / 1000 / (timeFromPreviousToll / 3600) // km/h
            : 0;

        const sequenceAnalysis: TollSequenceAnalysis = {
          tollIndex: index + 1,
          tollName: toll.name,
          tollCost: toll.tagCost,
          estimatedArrivalTime: toll.estimatedArrivalTime || journeyStartTime,
          timeFromStart,
          timeFromPreviousToll,
          distanceFromStart,
          distanceFromPreviousToll,
          averageSpeedBetweenTolls,
        };

        tollSequence.push(sequenceAnalysis);
      });
    }

    // Calculate total costs
    const totalTollCost = tolls.reduce((sum, toll) => sum + toll.tagCost, 0);
    const totalFuelCost = route.costs?.fuel || 0;
    const totalCost =
      totalTollCost + (options.includeFuelCost ? totalFuelCost : 0);

    // Calculate estimated arrival time
    const journeyStartTime = new Date();
    const estimatedArrivalTime = new Date(
      journeyStartTime.getTime() + (route.summary?.duration?.value || 0) * 1000,
    );

    // Check if route meets criteria
    const labels = route.summary?.labels || [];
    const hasPractical = labels.includes("practical");
    const hasCheapest = labels.includes("cheapest");
    const hasFastest = labels.includes("fastest");
    const labelCount = [hasPractical, hasCheapest, hasFastest].filter(
      Boolean,
    ).length;
    const meetsCriteria = labelCount >= 2 || hasPractical;

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
      estimatedArrivalTime,
      tolls,
      tollSequence,
    };
  }

  /**
   * Calculate distance from start for a specific toll (approximation)
   */
  private calculateDistanceFromStart(route: any, tollIndex: number): number {
    // This is an approximation - in real implementation, you would use
    // actual distance data from the route geometry
    const totalDistance = route.summary?.distance?.value || 0;
    const totalTolls = route.tolls?.length || 1;
    return (totalDistance / totalTolls) * (tollIndex + 1);
  }

  /**
   * Find the recommended route based on criteria
   */
  private findRecommendedRoute(
    routes: TollGuruRouteTolls[],
  ): TollGuruRouteTolls {
    // Priority: routes that meet criteria, then practical, then cheapest
    const routesMeetingCriteria = routes.filter((r) => r.meetsCriteria);

    if (routesMeetingCriteria.length > 0) {
      // Among routes meeting criteria, prefer practical
      const practicalRoutes = routesMeetingCriteria.filter((r) =>
        r.labels.includes("practical"),
      );
      return practicalRoutes.length > 0
        ? practicalRoutes[0]!
        : routesMeetingCriteria[0]!;
    }

    // If no routes meet criteria, return the cheapest
    return routes.length > 0
      ? routes.reduce((cheapest, current) =>
          current.totalCost < cheapest.totalCost ? current : cheapest,
        )
      : routes[0]!; // fallback to first route if available
  }

  /**
   * Compare routes based on different criteria
   */
  compareRoutes(analysisSummary: TollAnalysisSummary): TollComparisonResult {
    const allRoutes = [
      analysisSummary.recommendedRoute,
      ...analysisSummary.alternativeRoutes,
    ];

    const cheapestRoute = allRoutes.reduce((cheapest, current) =>
      current.totalCost < cheapest.totalCost ? current : cheapest,
    );

    const fastestRoute = allRoutes.reduce((fastest, current) =>
      current.duration.value < fastest.duration.value ? current : fastest,
    );

    const practicalRoute =
      allRoutes.find((r) => r.labels.includes("practical")) || cheapestRoute;

    return {
      cheapestRoute,
      fastestRoute,
      practicalRoute,
      routeComparison: {
        cheapest: {
          cost: cheapestRoute.totalCost,
          duration: cheapestRoute.duration.text,
          tollCount: cheapestRoute.totalTolls,
        },
        fastest: {
          cost: fastestRoute.totalCost,
          duration: fastestRoute.duration.text,
          tollCount: fastestRoute.totalTolls,
        },
        practical: {
          cost: practicalRoute.totalCost,
          duration: practicalRoute.duration.text,
          tollCount: practicalRoute.totalTolls,
        },
      },
    };
  }

  /**
   * Get toll statistics for a specific route
   */
  getTollStatistics(route: TollGuruRouteTolls): {
    totalTolls: number;
    totalCost: number;
    averageTollCost: number;
    mostExpensiveToll: TollGuruToll;
    cheapestToll: TollGuruToll;
    averageTimeBetweenTolls: number;
  } {
    const totalTolls = route.tolls.length;
    const totalCost = route.totalTollCost;
    const averageTollCost = totalTolls > 0 ? totalCost / totalTolls : 0;

    const mostExpensiveToll =
      route.tolls.length > 0
        ? route.tolls.reduce((max, current) =>
            current.tagCost > max.tagCost ? current : max,
          )
        : { name: "N/A", tagCost: 0 };

    const cheapestToll =
      route.tolls.length > 0
        ? route.tolls.reduce((min, current) =>
            current.tagCost < min.tagCost ? current : min,
          )
        : { name: "N/A", tagCost: 0 };

    const averageTimeBetweenTolls =
      route.tollSequence.length > 1
        ? route.tollSequence.reduce(
            (sum, seq) => sum + seq.timeFromPreviousToll,
            0,
          ) /
          (route.tollSequence.length - 1)
        : 0;

    return {
      totalTolls,
      totalCost,
      averageTollCost,
      mostExpensiveToll,
      cheapestToll,
      averageTimeBetweenTolls,
    };
  }
}
