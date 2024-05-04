export namespace backend {
	
	export class UpdateSessionSecondsLeft {
	    id: number;
	    seconds_left: number;
	
	    static createFrom(source: any = {}) {
	        return new UpdateSessionSecondsLeft(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.seconds_left = source["seconds_left"];
	    }
	}

}

export namespace store {
	
	export class Activity {
	    operation: number;
	    timestamp: string;
	    session_id: number;
	
	    static createFrom(source: any = {}) {
	        return new Activity(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.operation = source["operation"];
	        this.timestamp = source["timestamp"];
	        this.session_id = source["session_id"];
	    }
	}
	export class Session {
	    stage: string;
	    total_seconds: number;
	    timestamp: string;
	    seconds_left: number;
	
	    static createFrom(source: any = {}) {
	        return new Session(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.stage = source["stage"];
	        this.total_seconds = source["total_seconds"];
	        this.timestamp = source["timestamp"];
	        this.seconds_left = source["seconds_left"];
	    }
	}
	export class SessionDbRow {
	    stage: string;
	    total_seconds: number;
	    timestamp: string;
	    seconds_left: number;
	
	    static createFrom(source: any = {}) {
	        return new SessionDbRow(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.stage = source["stage"];
	        this.total_seconds = source["total_seconds"];
	        this.timestamp = source["timestamp"];
	        this.seconds_left = source["seconds_left"];
	    }
	}
	export class SessionDbRowMonth {
	    week: number;
	    stage: string;
	    total_seconds: number;
	    timestamp: string;
	    seconds_left: number;
	
	    static createFrom(source: any = {}) {
	        return new SessionDbRowMonth(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.week = source["week"];
	        this.stage = source["stage"];
	        this.total_seconds = source["total_seconds"];
	        this.timestamp = source["timestamp"];
	        this.seconds_left = source["seconds_left"];
	    }
	}
	export class SessionDbRowYear {
	    month: number;
	    stage: string;
	    total_seconds: number;
	    timestamp: string;
	    seconds_left: number;
	
	    static createFrom(source: any = {}) {
	        return new SessionDbRowYear(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.month = source["month"];
	        this.stage = source["stage"];
	        this.total_seconds = source["total_seconds"];
	        this.timestamp = source["timestamp"];
	        this.seconds_left = source["seconds_left"];
	    }
	}

}

