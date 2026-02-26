import { TollAnalysisService } from "../services/toll-analysis.service.js";

async function testTollAnalysisService() {
  console.log("Testing Enhanced Toll Analysis Service...");
  
  const service = new TollAnalysisService();
  
  try {
    // Test 1: Basic toll analysis with Nagpur to Hyderabad
    console.log("\n1. Testing getTollAnalysis (Nagpur to Hyderabad):");
    const analysisRequest = {
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
    
    const options = {
      includeFuelCost: true,
      includeCashCosts: true,
      calculateAverageSpeeds: true,
      formatTimeDisplay: true,
    };
    
    const result1 = await service.getTollAnalysis(analysisRequest, options);
    console.log("Status:", result1.status);
    console.log("Message:", result1.message);
    
    if (result1.data) {
      console.log("Origin:", result1.data.origin);
      console.log("Destination:", result1.data.destination);
      console.log("Total Routes:", result1.data.totalRoutes);
      console.log("Currency:", result1.data.currency);
      
      // Analyze recommended route
      const recommended = result1.data.recommendedRoute;
      console.log("\n--- Recommended Route ---");
      console.log("Route Name:", recommended.routeName);
      console.log("Total Tolls:", recommended.totalTolls);
      console.log("Total Toll Cost:", recommended.totalTollCost);
      console.log("Total Fuel Cost:", recommended.totalFuelCost);
      console.log("Total Cost:", recommended.totalCost);
      console.log("Duration:", recommended.duration.text);
      console.log("Distance:", recommended.distance.text);
      console.log("Labels:", recommended.labels.join(", "));
      console.log("Meets Criteria:", recommended.meetsCriteria);
      console.log("Estimated Arrival:", recommended.estimatedArrivalTime.toLocaleString());
      
      // Show toll sequence
      if (recommended.tolls.length > 0) {
        console.log("\n--- Toll Sequence ---");
        recommended.tolls.forEach((toll, index) => {
          console.log(`${index + 1}. ${toll.name} - ₹${toll.tagCost}`);
          if (toll.estimatedArrivalTime) {
            console.log(`   Arrival: ${toll.estimatedArrivalTime.toLocaleString()}`);
          }
        });
      }
      
      // Show toll sequence analysis
      if (recommended.tollSequence.length > 0) {
        console.log("\n--- Toll Sequence Analysis ---");
        recommended.tollSequence.forEach((seq) => {
          console.log(`${seq.tollIndex}. ${seq.tollName}`);
          console.log(`   Cost: ₹${seq.tollCost}`);
          console.log(`   Time from start: ${Math.round(seq.timeFromStart / 60)} min`);
          console.log(`   Time from previous: ${Math.round(seq.timeFromPreviousToll / 60)} min`);
          console.log(`   Distance from start: ${Math.round(seq.distanceFromStart / 1000)} km`);
          console.log(`   Avg speed: ${Math.round(seq.averageSpeedBetweenTolls)} km/h`);
        });
      }
    }
    
    // Test 2: Route comparison
    console.log("\n2. Testing compareRoutes:");
    if (result1.data) {
      const comparison = service.compareRoutes(result1.data);
      console.log("--- Route Comparison ---");
      console.log("Cheapest Route:", comparison.cheapestRoute.routeName);
      console.log("  Cost: ₹", comparison.routeComparison.cheapest.cost);
      console.log("  Duration:", comparison.routeComparison.cheapest.duration);
      console.log("  Tolls:", comparison.routeComparison.cheapest.tollCount);
      
      console.log("Fastest Route:", comparison.fastestRoute.routeName);
      console.log("  Cost: ₹", comparison.routeComparison.fastest.cost);
      console.log("  Duration:", comparison.routeComparison.fastest.duration);
      console.log("  Tolls:", comparison.routeComparison.fastest.tollCount);
      
      console.log("Practical Route:", comparison.practicalRoute.routeName);
      console.log("  Cost: ₹", comparison.routeComparison.practical.cost);
      console.log("  Duration:", comparison.routeComparison.practical.duration);
      console.log("  Tolls:", comparison.routeComparison.practical.tollCount);
    }
    
    // Test 3: Toll statistics
    console.log("\n3. Testing getTollStatistics:");
    if (result1.data) {
      const stats = service.getTollStatistics(result1.data.recommendedRoute);
      console.log("--- Toll Statistics ---");
      console.log("Total Tolls:", stats.totalTolls);
      console.log("Total Cost:", stats.totalCost);
      console.log("Average Toll Cost:", stats.averageTollCost);
      console.log("Most Expensive Toll:", stats.mostExpensiveToll.name, "- ₹", stats.mostExpensiveToll.tagCost);
      console.log("Cheapest Toll:", stats.cheapestToll.name, "- ₹", stats.cheapestToll.tagCost);
      console.log("Average Time Between Tolls:", Math.round(stats.averageTimeBetweenTolls / 60), "minutes");
    }
    
    // Test 4: Test with different options
    console.log("\n4. Testing with different options (fuel cost excluded):");
    const optionsNoFuel = {
      includeFuelCost: false,
      includeCashCosts: true,
      calculateAverageSpeeds: true,
      formatTimeDisplay: true,
    };
    
    const result2 = await service.getTollAnalysis(analysisRequest, optionsNoFuel);
    if (result2.data) {
      console.log("With fuel cost - Total:", result1.data?.recommendedRoute.totalCost);
      console.log("Without fuel cost - Total:", result2.data.recommendedRoute.totalCost);
      console.log("Fuel cost difference:", (result1.data?.recommendedRoute.totalCost || 0) - result2.data.recommendedRoute.totalCost);
    }
    
    console.log("\n✅ All Toll Analysis tests completed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testTollAnalysisService();
