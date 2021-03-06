import { Injectable } from '@angular/core';
import { FilesService } from './files.service';
import { UserService } from './user.service';
import { User } from 'src/app/models/dechat/user.model';
import { InboxElement, InboxElementType } from 'src/app/models/dechat/inbox-element.model';
import { ChatInfo } from 'src/app/models/dechat/chat-info.model';
import { ChatService } from './chat.service';
import { ChatMessage } from 'src/app/models/dechat/chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class InboxService {

  /**
   * The user of the application.
   * 
   * @type {User}
   */
  private user : User;

  /**
   * The new elements of the inbox.
   * 
   * @type {InboxElement}
   */
  private newElements : InboxElement[];
  private onElementFoundCallbacks;

  /**
   * Creates an inbox service.
   * 
   * @param files 
   *          The files service.
   * @param users 
   *          The users service.
   */
  constructor(
    private files : FilesService,
    private users : UserService
  ) {
    this.newElements = [];
    this.onElementFoundCallbacks = [];
    this.setUp();
  }

  /**
   * Sets up the inbox. Called when the service is created.
   */
  private async setUp() {
    await 4;

    console.log("Inbox setting up...");
    this.user = await this.users.getUser();
    setInterval(this.checkInbox.bind(this), 500/*2000*/);
  }

  addOnElementFoundCallback(callback) {
    this.onElementFoundCallbacks.push(callback);
  }

  /**
   * This function is called periodically, it checks if 
   * there are any new files in the inbox.
   */
  private async checkInbox() {

    if (this.user == undefined) {
      this.user = await this.users.getUser();
      return;
    }

    // Read files in inbox
    var url = this.files.getInboxUrl(this.user);
    var newFiles = [];
    var folder = await this.files.readFolder(url).then(
      result => {

        newFiles = result.filter((str, index, array) => str.includes("DeChatEn1a"));
        //console.log("INBOX HAS " + newFiles.length + " FILES");
        this.addInboxFiles(newFiles);
    });

    // Process new elements
    this.processNewElements();
  }

  /**
   * Proccesses any new element in the inbox.
   */
  private processNewElements() {
    this.newElements.forEach( element => {
      this.onElementFoundCallbacks.forEach(callback => { callback(element); });
    });
    this.newElements = [];
  }

  /**
   * Takes an array of urls and processes the requests.
   * 
   * @param files 
   *          The files' URLs.
   */
  private async addInboxFiles(files : string[]) {

    for (var i = 0; i < files.length; i ++) {

        var file = await this.files.readFile(files[i]);    
        if (file.length > 0) {
            var inboxElement : InboxElement = JSON.parse(file);
            this.newElements.push(inboxElement);
            console.log("Inbox element pushed: " + inboxElement)
        }
        this.files.deleteFile(files[i]);
    }
  }


  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
  /*                                                           */
  /*                         REQUESTS                          */
  /*                                                           */
  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  /**
   * Sends a chat request to a given user.
   * 
   * @param toUser 
   *          The given user.
   * @param chat 
   *          The chat that is requested.
   */
  public sendChatRequest(toUser: User, chat: ChatInfo) {

    var request : InboxElement;
    request = new InboxElement();
    request.chat = chat;
    request.type = InboxElementType.CHAT_REQUEST;

    var inboxUrl = this.files.getInboxUrl(toUser);
    var filename = inboxUrl + "DeChatEn1a_chatreq_" + chat.chatId + ".txt";

    this.sendRequest(request, filename);
  }


  /**
   * Sends a new message to the chat to a given user.
   * 
   * @param toUser 
   *          The given user,
   * @param chat 
   *          The chat to which the messages is sent.
   * @param message 
   *          The message.
   */
  public sendNewMessage(toUser: User, chat : ChatInfo, message : ChatMessage) {

    var request : InboxElement;
    request = new InboxElement();
    request.chat = chat;
    request.message = message;
    request.type = InboxElementType.NEW_MESSAGE;

    var inboxUrl = this.files.getInboxUrl(toUser);
    var filename = inboxUrl + "DeChatEn1a_newmsg_" + message.id + ".txt";

    this.sendRequest(request, filename);
  }

  /**
   * Sends a request given the inbox element and a filename.
   * 
   * @param inboxElement 
   *          The inbox element.
   * @param filename 
   *          The filename of the file to be created.
   */
  private sendRequest(inboxElement : InboxElement, filename: string) {
    
    console.log("Sending request...")
    var text = JSON.stringify(inboxElement);
    this.files.createFile(filename, text);
  }


}