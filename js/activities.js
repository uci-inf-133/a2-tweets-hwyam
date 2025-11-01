let tweet_array=[];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	const setText = (id, val) => {
   		const el = document.getElementById(id);
    	if (el) el.innerText = String(val);
	};

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.

	const dayName = d => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
	const isWeekend = d => {
		const n = d.getDay();
		return n == 0 || n == 6;
	};

	const rows = tweet_array.filter(t => t.source == "completed_event" && t.distance > 0 && t.activityType !== "unknown")
							.map(t => ({
								activityType: t.activityType,
								distance: t.distance,
								day: dayName(t.time),
								weekend: isWeekend(t.time)?"Weekend":"Weekday"
							}));

	const countsMap = {};
	for (const r of rows) countsMap[r.activityType] = (countsMap[r.activityType] || 0) +1;
	const counts = Object.entries(countsMap)
						 .map(([activityType, count]) => ({activityType, count}))
						 .sort((a,b) => b.count - a.count)


	//TODO: Add mark and encoding
	const topThree = counts.slice(0, 3).map(d => d.activityType);
	const topRows = rows.filter(r => topThree.includes(r.activityType));

	activity_vis_spec = {
	  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
	  description: "A graph of the number of Tweets containing each type of activity.",
	  data: {
	    values: counts
	  },	  
	  
	  mark:{type: "bar"},
	  encoding:{
		x:{field:"activityType", type:"nominal", sort: "-y", title:"Activity"},
		y:{field:"count", type:"quantitative", title:"Tweets"},
		tooltip: [{field: "activityType", title: "Activity"},
				  {field: "count", type:"quantitative", title: "Tweets"}]
	  }
	};

	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	const distance_vis_agg_spec = {
	  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
	  description: "Mean distance (top 3 activities)",
	  data: {
	    values: topRows
	  },	  
	  
	  mark:{type: "line", point: true},
	  encoding:{
		x:{field:"day", type:"ordinal", sort: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], title:"Day of week"},
		y:{aggregate:"mean", field:"distance", type:"quantitative", title:"Mean (mi)"},
		color:{field:"activityType", type:"nominal", title:"Activity"},
		tooltip: [{field: "activityType", title: "Activity"},
				  {field: "day", title: "Day"},
				  {aggregate: "mean", field:"distance", type: "quantitative", title:"Mean (mi)"}]
	  }
	};

	vegaEmbed("#distanceVisAggregated", distance_vis_agg_spec, {actions: false});

	const rawDiv = document.getElementById("distanceVis");
	const aggDiv = document.getElementById("distanceVisAggregated");
	const btn = document.getElementById("aggregate");

	rawDiv.style.display = "block";
	aggDiv.style.display = "none";
	btn.textContent = "Show means";

	btn.addEventListener("click", () => {
		if (rawDiv.style.display === "block") {
			rawDiv.style.display = "none";
			aggDiv.style.display = "block";
			btn.textContent = "Show all activities";
		} else {
			rawDiv.style.display = "block";
			aggDiv.style.display = "none";
			btn.textContent = "Show means";
		} 
	});

	const numOfType = Object.keys(countsMap).length;
	setText("numberActivities", numOfType);

	const [a1, a2, a3] = [counts[0], counts[1], counts[2]] || [];
	setText("firstMost", a1 ? a1.activityType: "N/A");
	setText("secondMost", a2 ? a2.activityType: "N/A");
	setText("thirdMost", a3 ? a3.activityType: "N/A");

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
	const distance_vis_spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Distances by day of week for the top 3 activities",
    data: { values: topRows },
    mark: { type: "point", opacity: 0.5 },
    encoding: {
		x: { field: "day", type: "ordinal", sort: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], title: "Day of week" },
		y: { field: "distance", type: "quantitative", title: "Distance (mi)" },
      	color: { field: "activityType", type: "nominal", title: "Activity" },
      	tooltip: [{ field: "activityType" }, { field: "day" }, { field: "distance" }]
   		}
	};

	vegaEmbed("#distanceVis", distance_vis_spec, {actions: false});


	const aggByActivity = {};
  	for (const r of topRows) {
    	if (!aggByActivity[r.activityType]) {
			aggByActivity[r.activityType] = { sum: 0, n: 0 };
		}
		aggByActivity[r.activityType].sum += r.distance;
		aggByActivity[r.activityType].n += 1;
		}

  	const means = Object.entries(aggByActivity)
    					.map(([activityType, v]) => ({ activityType, mean: v.sum / v.n }))
    					.sort((a, b) => b.mean - a.mean);

  	const longest = means[0] ? means[0].activityType : "N/A";
  	const shortest = means[means.length - 1] ? means[means.length - 1].activityType : "N/A";

	setText("longestActivityType",longest);
	setText("shortestActivityType",shortest);

	const weekActivity = {};
	for (const r of topRows){
		const key = r.activityType;
		if (weekActivity[key]){
		} else {
			weekActivity[key] = {weekendSum: 0, weekendTweet: 0, weekdaySum:0, weekdayTweet: 0}
		};
		if (r.weekend == "Weekend"){
			weekActivity[key].weekendSum += r.distance;
			weekActivity[key].weekendTweet += 1;
		} else {
			weekActivity[key].weekdaySum += r.distance;
			weekActivity[key].weekdayTweet += 1;
		}
	}

	let weekendLonger =0;
	let weekdayLonger =0;
	let tie = 0;

	const decimal = 1e-3;

	for (const activity of topThree){
		const a = weekActivity[activity];
		if (a){
			let weekendMPT = 0;
			let weekdayMPT = 0;
			if (a.weekendTweet > 0){
				weekendMPT = a.weekendSum / a.weekendTweet;
			}
			if (a.weekdayTweet > 0){
				weekdayMPT = a.weekdaySum / a.weekdayTweet;
			}

			if (weekendMPT > weekdayMPT){
				weekendLonger += 1;
			} else if (weekdayMPT > weekendMPT){
				weekdayLonger += 1;
			}

			const diff = weekendMPT - weekdayMPT;
			if(diff > decimal){
				weekendLonger += 1;
			} else if (diff < -decimal){
				weekdayLonger += 1;
			} else {
				tie += 1;
			}
		}
	}

	let result = "tie";
	if (weekendLonger > weekdayLonger){
		result = "weekends";
	} else if (weekdayLonger > weekendLonger) {
		result = "weekdays";
	}

	setText("weekdayOrWeekendLonger", result);
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});