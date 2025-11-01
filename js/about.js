let tweet_array = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(t=> (t instanceof Tweet) ? t: new Tweet(t.text ||t.tweet, t.time || t.created_at));

	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	const byId = (id, value) => {
		const element = document.getElementById(id);
		if (element){
			element.innerText = value;
		}
	};

	const setAll = (selector, value) => {
		document.querySelectorAll(selector)
				.forEach(element => (element.innerText = value));
	};

	byId("numberTweets", tweet_array.length);	

	const sorted = tweet_array.slice()
							  .sort((a,b) => new Date(a.time || a.created_at) - new Date(b.time || b.created_at));
	const first = new Date(sorted[0].time || sorted[0].created_at);
	const last = new Date(sorted[sorted.length - 1].time || sorted[sorted.length -1].created_at);

	const formatDate = date => date.toLocaleDateString(undefined, {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric"
		});

	byId("firstDate", formatDate(first));
	byId("lastDate", formatDate(last));

	let complete = 0;
	let live = 0;
	let achievement = 0;
	let miscellaneous = 0;

	for (let t of tweet_array){
		if (t.source == "completed_event") {
			complete++;
		}
		else if (t.source == "live_event") {
			live++;
		}
		else if (t.source == "achievement") {
			achievement++;
		}
		else miscellaneous++;
	}
	
	const total = tweet_array.length;
	const percent = (n) => ((n / total) * 100).toFixed(2) + "%";

	setAll(".completedEvents", String(complete));
	setAll(".liveEvents", String(live));
	setAll(".achievements", String(achievement));
	setAll(".miscellaneous", String(miscellaneous));

	setAll(".completedEventsPct", percent(complete));
	setAll(".liveEventsPct", percent(live));
	setAll(".achievementsPct", percent(achievement));
	setAll(".miscellaneousPct", percent(miscellaneous));

	const completedTweets = tweet_array.filter(t => t.source == "completed_event");
	const writtenTweets = completedTweets.filter(t => t.written);
	const written = writtenTweets.length;
	const writtenPct = completedTweets.length > 0 ? ((written / completedTweets.length) * 100).toFixed(2) + "%" : "0.00%";

	setAll(".written", String(written));
	setAll(".writtenPct", writtenPct);
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});