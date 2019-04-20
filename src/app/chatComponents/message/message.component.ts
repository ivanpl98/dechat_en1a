import {Component, Input, OnInit} from '@angular/core';
import {ChatMessage} from '../../models/dechat/chat-message.model';
import {MultimediaDisplayComponent} from '../multimedia-display/multimedia-display.component';
import { UserService } from 'src/app/services/dechat/user.service';

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {

    @Input() chatMessage: ChatMessage;
    @Input() multimedia: MultimediaDisplayComponent;
    userEmail: string;
    userName: string;
    messageContent: string;
    timeSent: string;
    isOwnMessage: boolean;
    ready: boolean;

    constructor(private users : UserService) {
        this.ready = true;
        this.isOwnMessage = false;
    }

    async ngOnInit(chatMessage = this.chatMessage, multim = this.multimedia) {
        if (chatMessage == undefined) {
            chatMessage = new ChatMessage("");
            chatMessage.userName = "dummy";
        }

        this.messageContent = chatMessage.message;
        this.userName = chatMessage.userName;
        this.timeSent = this.getTimeStamp(chatMessage.date);
        this.isOwnMessage = chatMessage.isMessageFrom(await this.users.getUser())
    }

    getTimeStamp(date: Date) {

        const day = date.getUTCFullYear() + '/' +
            (date.getUTCMonth() + 1) + '/' +
            date.getUTCDate();

        const time = date.getUTCHours() + ':' +
            date.getUTCMinutes();

        return day + ' ' + time;
    }

}
