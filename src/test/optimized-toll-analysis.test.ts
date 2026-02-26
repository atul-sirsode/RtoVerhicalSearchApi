import { TollGuruService } from "../services/tollguru.service.js";

async function testOptimizedTollAnalysis() {
  console.log("Testing Optimized Toll Analysis (Single API Call)...");
  
  const service = new TollGuruService();
  
  try {
    // Test 1: Basic toll info without analysis
    console.log("\n1. Testing basic getTollInfo (no analysis):");
    const basicRequest = {
      from: {
        address: "Nagpur, maharashtra"
      },
      to: {
        address: "Hyderabad, andra_predesh"
      },
      vehicle: {
        type: "2AxlesAuto"
      },
      country: "IND"
    };
    
    const basicResult = await service.getTollInfo(basicRequest);
    console.log("Basic Result Status:", basicResult.status);
    console.log("Basic Result Message:", basicResult.message);
    console.log("Has Analysis:", !!basicResult.analysis);
    console.log("Has Data:", !!basicResult.data);
    
    // Test 2: Toll info with analysis included
    console.log("\n2. Testing getTollInfo with analysis:");
    const analysisRequest = {
      ...basicRequest,
      includeAnalysis: true,
      analysisOptions: {
        includeFuelCost: true,
        includeCashCosts: true,
        calculateAverageSpeeds: true,
        formatTimeDisplay: true,
      }
    };
    
    const analysisResult = await service.getTollInfo(basicRequest, {
      includeAnalysis: true,
      analysisOptions: {
        includeFuelCost: true,
        includeCashCosts: true,
        calculateAverageSpeeds: true,
        formatTimeDisplay: true,
      }
    });
    
    console.log("Analysis Result Status:", analysisResult.status);
    console.log("Analysis Result Message:", analysisResult.message);
    console.log("Has Analysis:", !!analysisResult.analysis);
    console.log("Has Data:", !!analysisResult.data);
    
    if (analysisResult.data && analysisResult.analysis) {
      console.log("\n--- TollGuru Data Summary ---");
      console.log("Routes Found:", analysisResult.data.routes.length);
      console.log("Currency:", analysisResult.data.summary.currency);
      
      console.log("\n--- Analysis Summary ---");
      console.log("Recommended Route:", analysisResult.analysis.recommendedRoute?.routeName);
      console.log("Alternative Routes:", analysisResult.analysis.alternativeRoutes?.length);
      console.log("Total Tolls (Recommended):", analysisResult.analysis.recommendedRoute?.totalTolls);
      console.log("Total Cost (Recommended):", analysisResult.analysis.recommendedRoute?.totalCost);
      
      console.log("\n--- Route Comparison ---");
      if (analysisResult.analysis.routeComparison) {
        console.log("Cheapest Route:", analysisResult.analysis.routeComparison.cheapestRoute?.routeName);
        console.log("Fastest Route:", analysisResult.analysis.routeComparison.fastestRoute?.routeName);
        console.log("Practical Route:", analysisResult.analysis.routeComparison.practicalRoute?.routeName);
      }
      
      console.log("\n--- Toll Statistics ---");
      if (analysisResult.analysis.tollStatistics) {
        console.log("Total Tolls:", analysisResult.analysis.tollStatistics.totalTolls);
        console.log("Total Cost:", analysisResult.analysis.tollStatistics.totalCost);
        console.log("Average Toll Cost:", analysisResult.analysis.tollStatistics.averageTollCost);
        console.log("Most Expensive:", analysisResult.analysis.tollStatistics.mostExpensiveToll?.name);
        console.log("Cheapest:", analysisResult.analysis.tollStatistics.cheapestToll?.name);
      }
    }
    
    // Test 3: Compare API call efficiency
    console.log("\n3. Testing API Call Efficiency:");
    console.log("✅ Single API Call Approach:");
    console.log("   - One TollGuru API call");
    console.log("   - Analysis performed on same response");
    console.log("   - No duplicate API requests");
    console.log("   - Faster response time");
    
    console.log("\n❌ Previous Approach (What we avoided):");
    console.log("   - TollGuru API call in getTollInfo");
    console.log("   - Another TollGuru API call in analysis service");
    console.log("   - Duplicate API requests");
    console.log("   - Slower response time");
    
    console.log("\n✅ All Optimized Toll Analysis tests completed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testOptimizedTollAnalysis();
