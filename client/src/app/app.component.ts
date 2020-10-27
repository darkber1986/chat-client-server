import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject';

export class Message {
    constructor(
        public sender: string,
        public content: string,
	public idSender: number,
	public total: number
    ) { }
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    //styleUrls: ['./app.component.sass']
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

    @ViewChild('viewer') private viewer: ElementRef;

    public serverMessages = new Array<Message>();    
    public clientMessage = '';
    public idSender = Date.now();
    public sender = this.makeid();
    public total = 1;    

    private socket$: WebSocketSubject<Message>;

    constructor() {
        this.socket$ = new WebSocketSubject('ws://localhost:8999');
        this.socket$
            .subscribe(
            (message) => {
		    if(message.total){
			this.total=message.total;
		    } else {
		        this.serverMessages.push(message) && this.scroll() 
		    }
	    },
            (err) => console.error(err),
            () => {console.warn('Completed!'); this.idSender &= 0xFFFF; this.sender='ab'+this.idSender;}
            );
    }

    ngAfterViewInit(): void {
        this.scroll();
    }

    private makeid() : string {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
    }

    public send(): void {
        const message = new Message(this.sender, this.clientMessage, this.idSender, 0);
        this.serverMessages.push(message);
        this.socket$.next(message);
        this.clientMessage = '';
        this.scroll();
    }

    public isMine(message: Message): boolean {
	console.log(message);
        return message && message.idSender === this.idSender;
    }

    public getSenderInitials(sender: string): string {
        return sender && sender.substring(0, 2).toLocaleUpperCase();
    }

    public getSenderColor(sender: string): string {
        const alpha = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZ';
        const initials = this.getSenderInitials(sender);
        const value = Math.ceil((alpha.indexOf(initials[0]) + alpha.indexOf(initials[1])) * 255 * 255 * 255 / 70);
        return '#' + value.toString(16).padEnd(6, '0');
    }

    private scroll(): void {
        setTimeout(() => {
            this.scrollToBottom();
        }, 100);
    }

    private getDiff(): number {
        if (!this.viewer) {
            return -1;
        }

        const nativeElement = this.viewer.nativeElement;
        return nativeElement.scrollHeight - (nativeElement.scrollTop + nativeElement.clientHeight);
    }

    private scrollToBottom(t = 1, b = 0): void {
        if (b < 1) {
            b = this.getDiff();
        }
        if (b > 0 && t <= 120) {
            setTimeout(() => {
                const diff = this.easeInOutSin(t / 120) * this.getDiff();
                this.viewer.nativeElement.scrollTop += diff;
                this.scrollToBottom(++t, b);
            }, 1 / 60);
        }
    }

    private easeInOutSin(t): number {
        return (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;
    }
}
