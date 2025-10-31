let tweet_array = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	const sorted = tweet_array.slice().sort((a,b) => a.time - b.time);
	const first = sorted[0].time;
	const last = sorted[sorted.length - 1].time;

	const formatDate = date => date.toLocaleDateString(undefined, {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric"
		});

	document.getElementById("firstDate").innerText = formatDate(first);
	document.getElementById("LastDate").innerText = formatDate(last);

	let complete = 0;
	live = 0;
	achievement = 0;
	miscellaneous = 0;

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
		else misc++;
	}
	
	document.getElementById("completedEvents").innerText = completed;
	document.getElementById("liveEvents").innerText = live;
	document.getElementById("achievements").innerText = achievement;
	document.getElementById("miscellaneous").innerText = misc;

	const completedTweets = tweet_array.filter(t => t.source === "completed_event");
	const writtenTweets = completedTweets.filter(t => t.written);
	const percent = completedTweets.length > 0 ? (writtenTweets.length / completedTweets.length) * 100 : 0;

  document.getElementById("writtenPercent").innerText = percent.toFixed(2) + "%";
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});