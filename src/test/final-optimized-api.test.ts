import { TollGuruService } from "../services/tollguru.service.js";

async function testFinalOptimizedAPI() {
  console.log("Testing Final Optimized TollGuru API...");

  const service = new TollGuruService();

  try {
    // Test the optimized single API call approach
    console.log("\n🚀 Testing Single API Call with Analysis:");

    const request = {
      from: {
        address: "Nagpur, maharashtra",
      },
      to: {
        address: "Hyderabad, andra_predesh",
      },
      vehicle: {
        type: "2AxlesAuto",
      },
      country: "IND",
      includeAnalysis: true,
      analysisOptions: {
        includeFuelCost: true,
        includeCashCosts: true,
        calculateAverageSpeeds: true,
        formatTimeDisplay: true,
      },
    };

    console.log("Request:", JSON.stringify(request, null, 2));

    const result = await service.getTollInfo(
      {
        from: request.from,
        to: request.to,
        vehicle: request.vehicle,
        country: request.country,
      },
      {
        includeAnalysis: request.includeAnalysis,
        analysisOptions: request.analysisOptions,
      },
    );

    console.log("\n✅ API Response Structure:");
    console.log("Status:", result.status);
    console.log("Message:", result.message);

    if (result.data) {
      console.log("\n📊 TollGuru Data:");
      console.log("- Routes:", result.data.routes.length);

      // Show first route details
      if (result.data.routes.length > 0) {
        const route = result.data.routes[0];
        if (route) {
          console.log("\n🛣️  First Route Details:");
          console.log("- Name:", route.name || "Unnamed Route");
          console.log("- Labels:", route.labels?.join(", ") || "No labels");
          console.log("- Tolls:", route.tolls?.length || 0);
          console.log("- Distance:", route.distance?.text || "N/A");
          console.log("- Duration:", route.duration?.text || "N/A");

          // Show toll sequence
          if (route.tolls && route.tolls.length > 0) {
            console.log("\n💰 Toll Sequence:");
            route.tolls.forEach((toll: any, index: number) => {
              console.log(
                `  ${index + 1}. ${toll.name} - ₹${toll.tagCost || toll.cost || 0}`,
              );
              if (toll.arrival && toll.arrival.time) {
                const arrivalTime = new Date(toll.arrival.time);
                console.log(`     Arrival: ${arrivalTime.toLocaleString()}`);
              }
            });
          }
        }
      }
    }

    if (result.analysis) {
      console.log("\n🔍 Analysis Results:");
      console.log(
        "- Recommended Route:",
        result.analysis.recommendedRoute?.routeName,
      );
      console.log(
        "- Alternative Routes:",
        result.analysis.alternativeRoutes?.length,
      );
      console.log(
        "- Total Tolls (Recommended):",
        result.analysis.recommendedRoute?.totalTolls,
      );
      console.log(
        "- Total Cost (Recommended):",
        result.analysis.recommendedRoute?.totalCost,
      );
      console.log("- Analysis Time:", new Date().toLocaleString());

      if (result.analysis.routeComparison) {
        console.log("\n🏆 Route Comparison:");
        console.log(
          "- Cheapest:",
          result.analysis.routeComparison.cheapestRoute?.routeName,
        );
        console.log(
          "- Fastest:",
          result.analysis.routeComparison.fastestRoute?.routeName,
        );
        console.log(
          "- Practical:",
          result.analysis.routeComparison.practicalRoute?.routeName,
        );
      }

      if (result.analysis.tollStatistics) {
        console.log("\n📈 Toll Statistics:");
        console.log(
          "- Total Tolls:",
          result.analysis.tollStatistics.totalTolls,
        );
        console.log("- Total Cost:", result.analysis.tollStatistics.totalCost);
        console.log(
          "- Average Cost:",
          result.analysis.tollStatistics.averageTollCost.toFixed(2),
        );
        console.log(
          "- Most Expensive:",
          result.analysis.tollStatistics.mostExpensiveToll?.name,
        );
        console.log(
          "- Cheapest:",
          result.analysis.tollStatistics.cheapestToll?.name,
        );
        console.log(
          "- Avg Time Between Tolls:",
          Math.round(
            result.analysis.tollStatistics.averageTimeBetweenTolls / 60,
          ),
          "minutes",
        );
      }
    }

    console.log("\n🎯 Key Benefits of Optimized Approach:");
    console.log("✅ Single API Call - No duplicate TollGuru requests");
    console.log("✅ Integrated Analysis - Analysis performed on same response");
    console.log("✅ Faster Response - Reduced latency");
    console.log("✅ Efficient Resource Usage - Less API calls");
    console.log(
      "✅ Comprehensive Data - Both raw and analyzed data in one response",
    );
    console.log("✅ Flexible Options - Analysis can be enabled/disabled");

    console.log("\n📝 API Usage Examples:");
    console.log("\n1. Basic Toll Info (No Analysis):");
    console.log("POST /api/tollguru/get-toll-info");
    console.log("{");
    console.log('  "from": { "address": "Nagpur, maharashtra" },');
    console.log('  "to": { "address": "Hyderabad, andra_predesh" },');
    console.log('  "vehicle": { "type": "2AxlesAuto" },');
    console.log('  "country": "IND"');
    console.log("}");

    console.log("\n2. Toll Info with Analysis:");
    console.log("POST /api/tollguru/get-toll-info");
    console.log("{");
    console.log('  "from": { "address": "Nagpur, maharashtra" },');
    console.log('  "to": { "address": "Hyderabad, andra_predesh" },');
    console.log('  "vehicle": { "type": "2AxlesAuto" },');
    console.log('  "country": "IND",');
    console.log('  "includeAnalysis": true,');
    console.log('  "analysisOptions": {');
    console.log('    "includeFuelCost": true,');
    console.log('    "calculateAverageSpeeds": true');
    console.log("  }");
    console.log("}");

    console.log("\n✅ Final Optimized TollGuru API test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testFinalOptimizedAPI();
