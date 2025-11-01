let tweet_array=[];
let written_tweets=[];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	tweet_array = runkeeper_tweets.map(t => new Tweet(t.text || t.tweet, t.time || t.created_at));
	written_tweets = tweet_array.filter(t => t.written);

	renderTable('');
}

function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	const input = document.getElementById('textFilter');
	if (input) {
		input.addEventListener('input', ()=>{ renderTable(input.value || '');});
	}
}

function renderTable(query){
	const tweetTable = document.getElementById('tweetTable');
	const searchCount = document.getElementById('searchCount');
	const searchText = document.getElementById('searchText');

	const q = String(query || '').trim();

	if (searchText) searchText.textContent = q;
	if (q === '') {
		if (searchCount) searchCount.textContent = '0';
		if (tweetTable) tweetTable.innerHTML = '';
		return;
	}
	const lower = q.toLowerCase();
	const match = written_tweets.filter( t => {
		const backToRaw = (t.writtenText && t.writtenText.length ? t.writtenText : t.text) || '';
		return backToRaw.toLowerCase().includes(lower);
	});
	if (searchCount) searchCount.textContent = String(match.length);
	if (tweetTable) tweetTable.innerHTML = match.map((t, i) => t.getHTMLTableRow(i + 1)).join('');
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});