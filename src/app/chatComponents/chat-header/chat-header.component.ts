import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-header',
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.css']
})
export class ChatHeaderComponent implements OnInit {

//Atributes
  ready: boolean;


  constructor() {
  	this.ready = true;
   }

  ngOnInit() {
  }

}
