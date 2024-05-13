export namespace backend {
	
	export class AppState {
	    focusTime: number;
	    shortBreakTime: number;
	    longBreakTime: number;
	    rounds: number;
	    volume: number;
	    theme: string;
	    alarmSound: string;
	
	    static createFrom(source: any = {}) {
	        return new AppState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.focusTime = source["focusTime"];
	        this.shortBreakTime = source["shortBreakTime"];
	        this.longBreakTime = source["longBreakTime"];
	        this.rounds = source["rounds"];
	        this.volume = source["volume"];
	        this.theme = source["theme"];
	        this.alarmSound = source["alarmSound"];
	    }
	}
	export class DaysReport {
	    daysAccessed: number;
	    secondsFocussed: number;
	    daysStreak: number;
	
	    static createFrom(source: any = {}) {
	        return new DaysReport(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.daysAccessed = source["daysAccessed"];
	        this.secondsFocussed = source["secondsFocussed"];
	        this.daysStreak = source["daysStreak"];
	    }
	}
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
	export class InnerMapWrapper {
	    innerWrapper: {[key: string]: SessionDbRow};
	
	    static createFrom(source: any = {}) {
	        return new InnerMapWrapper(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.innerWrapper = this.convertValues(source["innerWrapper"], SessionDbRow, true);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ResponseByDate {
	    item: {[key: string]: InnerMapWrapper};
	
	    static createFrom(source: any = {}) {
	        return new ResponseByDate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.item = this.convertValues(source["item"], InnerMapWrapper, true);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
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

}

