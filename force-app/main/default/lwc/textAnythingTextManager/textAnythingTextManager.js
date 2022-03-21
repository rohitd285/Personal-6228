import { LightningElement, track, api } from "lwc";
import getAllTextMessages from "@salesforce/apex/TextAnythingTextManagerController.getAllTextMessages";
export default class TextAnythingTextManager extends LightningElement {
    @track wrapMain = new Object();
    @track lstMessage = [];
    @track loaded = true;
    @api unReadOnly = false;
    @api diplayChatPanel = false;
    @api recordId;
    @api objectApiName;
    @track socket = null;
    @track isWSConnected = false;
    @track strErrorMsg = '';

    connectedCallback() {
        this.getAllTexts(false);
    }

    getAllTexts(unReadOnly) {
        this.onClearMessage();
        getAllTextMessages({
            unReadOnly: unReadOnly,
        })
            .then((result) => {
                if(JSON.parse(result).isSetUpCompleted==true)
                {
                    this.lstMessage = JSON.parse(result).WrapperTextManagerList;
                if (!this.isWSConnected) {
                    this.connect(
                        JSON.parse(result).currentUserId,
                        JSON.parse(result).organizationId,
                        JSON.parse(result).wsChatEndpoint
                    );
                    this.isWSConnected = true;
                }
                }
                else{
                    this.strErrorMsg=JSON.parse(result).strMsg;
                }
                
            })
            .catch((error) => {
                if (error) {
                    var errorMg = "Unknown error";
                    if (Array.isArray(error.body)) {
                        errorMg = error.body.map((e) => e.message);
                    }
                    // UI API DML, Apex and network errors
                    else if (error.body && typeof error.body.message === "string") {
                        errorMg = error.body.message;
                    }
                    // JS errors
                    else if (typeof error.message === "string") {
                        errorMg = error.message;
                    }
                    this.strErrorMsg = errorMg;
                }
            });
    }

    onClearMessage() {
        this.strErrorMsg = '';
    }

    handleChangeUnread(event) {
        this.unReadOnly = event.detail.checked;
        this.getAllTexts(event.detail.checked);
    }
    handleClickTextMessage(event) {
        if (event.target.dataset.id) {
            var selectedMsg = this.lstMessage.find(
                (item) => item.recordId == event.target.dataset.id
            );
            this.recordId = event.target.dataset.id;
            this.objectApiName = selectedMsg.objectApiName;
            this.diplayChatPanel = true;
        }
    }
    handleClickBack(event) {
        this.onClearMessage();
        this.recordId = "";
        this.objectApiName = "";
        this.unReadOnly = event.detail;
        this.diplayChatPanel = false;
        this.getAllTexts(this.unReadOnly);
    }

    connect(currentUserId, organizationId, wsChatEndpoint) {
        this.socket = new WebSocket(wsChatEndpoint);
        var self = this;
        this.socket.onopen = function (event) {
            self.sendDummyMessage(currentUserId, organizationId);
        };
        this.socket.onmessage = function (event) {
            if (JSON.stringify(event.data) != 'client details saved successfully.') {
                self.getAllTexts(self.unReadOnly);
            }
        };

        this.socket.onerror = function (event) {
            this.strErrorMsg = 'Error Connecting to AWS Web Socket Chat.';
        };

        this.socket.onclose = function (event) {

        };
    }
    sendDummyMessage(currentUserId, organizationId) {
        this.onClearMessage();
        var payload = {
            action: "saveclientdetails",
            data: {
                userId: currentUserId,
                organizationId: organizationId,
            },
        };

        try {
            this.socket.send(JSON.stringify(payload));
        } catch (e) {
            this.strErrorMsg = 'Error Connecting to AWS Web Socket Chat.';
        }
    }

    disconnect() {
        this.socket.close();
        this.isWSConnected = false;
    }

}