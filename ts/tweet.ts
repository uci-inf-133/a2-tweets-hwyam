class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

    //helper function
    private static strip(text:string): string{
        let s = text.replace(/https?:\/\/\S+/gi, "")
                    .replace(/#runkeeper/gi,"")
                    .replace(/with\s+@runkeeper\.?/gi, "")
                    .replace(/check it out!?/gi, "")
                    .replace(/just\s+(completed | posted)\s+a/gi, "")
                    .replace(/\s+/g, " ")
                    .trim();
        return s;
    }

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        const t = this.text.toLowerCase().trim();
        if (t.startsWith("just completed a") || t.startsWith("just finished a") || t.startsWith("just posted a")){
            return "complete";
        }
        if (t.includes("currently") || t.includes("right now")){
            return "live event";
        }
        if (t.includes("achieved") || t.includes("record")){
            return "achievement"
        }
        return "mischellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written
        return Tweet.strip(this.text).length > 0;
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        //TODO: parse the written text from the tweet
        return Tweet.strip(this.text);
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        const lowerText = this.text.toLowerCase();
        const content = lowerText.match(/(\d+(?:\.\d+)?)\s*(km|mi)\s+([a-z]+)/);

        if (!content) {
            return "unknown";
        }

        let activity = content[3];
        if (activity.includes("running")) {
            return "run";
        }
        if (activity == "walking") {
            return "walk";
        }
        if (activity == "swimming") {
            return "swim";
        }
        if (activity.includes("biking") || (activity.includes("cycling")) ){
            return "bike";
        }

        return activity.charAt(0).toUpperCase() + activity.substring(1);
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        const lowerText = this.text.toLowerCase();
        const content = lowerText.match(/(\d+(\.\d+)?)\s*(km|mi)/);

        if(!content) {
            return 0;
        }

        const value = parseFloat(content[1]);
        const unit = content[3];

        let mile = value;
        if (unit == "km"){
            mile = value / 1.609;
        }
        return +mile.toFixed(2);
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        const urlContent = this.text.match(/https?:\/\/\S+/i);
        
        let url;
        if (urlContent){
            url = urlContent[0];
        } else{
            url = "#";
        }

        const safeText = this.text
                             .replace(/&/g, "&amp;")
                             .replace(/</g, "&lt;")
                             .replace(/>/g, "&gt;");
                             
        return `<tr>
                    <td>${rowNumber}</td>
                    <td>${this.activityType}</td>
                    <td><a href = "${url}" target= "_blank">${safeText}</a></td>
                </tr>`;
    }
}