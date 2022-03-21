import { LightningElement, track, api } from 'lwc';
import initTextAnythingChatPanelController from '@salesforce/apex/TextAnythingChatPanelController.initTextAnythingChatPanelController';
import saveMessage from '@salesforce/apex/TextAnythingChatPanelController.saveMessage';
import { loadStyle } from 'lightning/platformResourceLoader';
import CUSTOM_CSS from '@salesforce/resourceUrl/custom_style';
export default class TextAnythingChatPanel extends LightningElement {

    @api recordId;
    @api objectApiName;
    @api displayBackBtn = false;
    @api unReadOnly = false;
    @api ulCss = "min-height:280px; max-height:300px;overflow-y:auto;padding:0px;background:white;overflow-x:hidden;";
    @track wrapMain = new Object();
    @track lstMessage = [];
    @track NameOfChatStarter = '';
    @track txtMsg = '';
    @track medialUrl = '';
    @track isBtn = false;
    @track isButtonDisabled = true;
    @track loaded = false;
    @track socket1 = null;
    @track isWSConnected1 = false;
	@track nameIntial = '';
	@track currentUserIntial = '';

    connectedCallback() {
        this.doInIt();
        loadStyle(this, CUSTOM_CSS)
            .then(() => { });
    }

    doInIt() {
        this.loaded = true;
        initTextAnythingChatPanelController({ recordId: this.recordId, objName: this.objectApiName })
            .then(result => {
                if (JSON.parse(result).isSuccess) {
                    this.wrapMain = JSON.parse(result);
					this.nameIntial = this.wrapMain.nameIntial;
					this.currentUserIntial = this.wrapMain.currentUserIntial;
					
                    //changes for AWS Chat
                    if (!this.isWSConnected1) {
                        this.connect(
                            JSON.parse(result).currentUserId,
                            JSON.parse(result).organizationId
                        );
                        this.isWSConnected1 = true;
                    }
                    this.lstMessage = [];
                    if (this.wrapMain.lstTxtMsg.length > 0) {
                        for (let i = 0; i < this.wrapMain.lstTxtMsg.length; i++) {
                            if (this.wrapMain.lstTxtMsg[i].objTXT.Direction__c == 'Outbound') {
                                this.lstMessage.push({
                                    showAvatar: false,
                                    showSmallDetails: this.wrapMain.lstTxtMsg[i].isShow,
                                    avatr: '',
                                    objDetails: this.wrapMain.lstTxtMsg[i].objTXT,
                                    senderName: this.wrapMain.lstTxtMsg[i].smallDetails,
                                    styleClass: 'slds-chat-listitem slds-chat-listitem_outbound',
                                    styleDiv: 'slds-chat-message__text slds-chat-message__text_outbound-agent outboundStyle',
                                    styleText: 'outboundTextStyle',
                                    isPending: this.wrapMain.lstTxtMsg[i].isPending,
                                    isSent: this.wrapMain.lstTxtMsg[i].isSent,
                                    isFailed: this.wrapMain.lstTxtMsg[i].isFailed,
                                    strMsgOwnerInitials: this.wrapMain.lstTxtMsg[i].strMsgInitials
                                });
                            } else {
                                this.lstMessage.push({
                                    showAvatar: true,
                                    showSmallDetails: this.wrapMain.lstTxtMsg[i].isShow,
                                    avatr: this.wrapMain.nameIntial,
                                    objDetails: this.wrapMain.lstTxtMsg[i].objTXT,
                                    senderName: this.wrapMain.lstTxtMsg[i].smallDetails,
                                    styleClass: 'slds-chat-listitem slds-chat-listitem_inbound chatMsgMarginStyle',
                                    styleDiv: 'slds-chat-message__text slds-chat-message__text_inbound inboundStyle',
                                    styleText: 'inboundTextStyle',
                                    isPending: this.wrapMain.lstTxtMsg[i].isPending,
                                    isSent: this.wrapMain.lstTxtMsg[i].isSent,
                                    isFailed: this.wrapMain.lstTxtMsg[i].isFailed,
                                    strMsgOwnerInitials: this.wrapMain.lstTxtMsg[i].strMsgInitials
                                });
                            }
                        }
                        this.NameOfChatStarter = this.lstMessage[0].senderName;
						
                    } else {
                        this.NameOfChatStarter = 'None';
                    }
                    if (this.wrapMain.isPNA) {
                        this.isBtn = true;
                        this.isButtonDisabled = true;
                    }
                } else {
                    this.NameOfChatStarter = 'None';
                    this.wrapMain = JSON.parse(result);
                    this.wrapMain.isPNA = true;
                }
                this.loaded = true;
            })
            .catch(error => {
                if (error) {
                    this.error = 'Unknown error';
                    if (Array.isArray(error.body)) {
                        this.error = error.body.map(e => e.message);
                    }
                    // UI API DML, Apex and network errors
                    else if (error.body && typeof error.body.message === 'string') {
                        this.error = error.body.message;
                    }
                    // JS errors
                    else if (typeof error.message === 'string') {
                        this.error = error.message;
                    }
                    this.NameOfChatStarter = 'None';
                    this.wrapMain = JSON.parse(result);
                    this.wrapMain.isPNA = true;
                    this.wrapMain.strMsg = this.error;
                }
                this.loaded = true;
            });
    }

    handleClose(event) {
        this.wrapMain.isPNA = false;
    }

    trackCharacters(event) {
        this.txtMsg = event.target.value;

        if (this.txtMsg != null && this.txtMsg != '') {
            this.isButtonDisabled = false;
        }
        else {
            this.isButtonDisabled = true;
        }
    }

    trackURL(event) {
        this.medialUrl = event.target.value;
    }

    scrollToTop() {
        let objDiv = this.template.querySelector('.myScrollClass');
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    handleSend(event) {
        this.onClearMessage();
        if ((this.txtMsg != null && this.txtMsg != '' && this.txtMsg != undefined) || (this.medialUrl != null && this.medialUrl != '' && this.medialUrl != undefined)) {
            this.loaded = false;
            saveMessage({ wrapString: JSON.stringify(this.wrapMain), recordId: this.recordId, msg: this.txtMsg, objectName: this.objectApiName, mediaUrl: this.medialUrl })
                .then(result => {
                    var responseData = JSON.parse(result);
                    if (responseData.isSuccess) {
                        this.lstMessage = [];
                        this.wrapMain = responseData;
                        if (this.wrapMain.lstTxtMsg.length > 0) {
                            for (let i = 0; i < this.wrapMain.lstTxtMsg.length; i++) {
                                if (this.wrapMain.lstTxtMsg[i].objTXT.Direction__c == 'Outbound') {
                                    this.lstMessage.push({
                                        showAvatar: false,
                                        showSmallDetails: this.wrapMain.lstTxtMsg[i].isShow,
                                        avatr: '',
                                        objDetails: this.wrapMain.lstTxtMsg[i].objTXT,
                                        senderName: this.wrapMain.lstTxtMsg[i].smallDetails,
                                        styleClass: 'slds-chat-listitem slds-chat-listitem_outbound',
                                        styleDiv: 'slds-chat-message__text slds-chat-message__text_outbound-agent outboundStyle',
                                        styleText: 'outboundTextStyle',
                                        isPending: this.wrapMain.lstTxtMsg[i].isPending,
                                        isSent: this.wrapMain.lstTxtMsg[i].isSent,
                                        isFailed: this.wrapMain.lstTxtMsg[i].isFailed,
                                        strMsgOwnerInitials: this.wrapMain.lstTxtMsg[i].strMsgInitials
                                    });
                                } else {
                                    this.lstMessage.push({
                                        showAvatar: true,
                                        showSmallDetails: this.wrapMain.lstTxtMsg[i].isShow,
                                        avatr: this.wrapMain.nameIntial,
                                        objDetails: this.wrapMain.lstTxtMsg[i].objTXT,
                                        senderName: this.wrapMain.lstTxtMsg[i].smallDetails,
                                        styleClass: 'slds-chat-listitem slds-chat-listitem_inbound chatMsgMarginStyle',
                                        styleDiv: 'slds-chat-message__text slds-chat-message__text_inbound inboundStyle',
                                        styleText: 'inboundTextStyle',
                                        isPending: this.wrapMain.lstTxtMsg[i].isPending,
                                        isSent: this.wrapMain.lstTxtMsg[i].isSent,
                                        isFailed: this.wrapMain.lstTxtMsg[i].isFailed,
                                        strMsgOwnerInitials: this.wrapMain.lstTxtMsg[i].strMsgInitials
                                    });
                                }
                            }
                            this.NameOfChatStarter = this.lstMessage[0].senderName;
							
							
                        } else {
                            this.NameOfChatStarter = 'None';
                        }
                        this.txtMsg = '';
                        this.isButtonDisabled = true;
                        this.medialUrl = '';
                        if (this.wrapMain.isPNA) {
                            this.isBtn = true;
                            this.isButtonDisabled = true;
                        }
                    } else {
                        this.NameOfChatStarter = 'None';
                        
                        this.wrapMain = responseData;
                        this.wrapMain.isPNA = true;
                        if(this.wrapMain.strMsg=='Your trial account has expired. Please upgrade your account.')
                        {
                            this.wrapMain.strMsg='Your trial account has expired.Go to your'+' <a href="'+ this.wrapMain.url+'" target="_blank">Text Anything admin panel</a>'+ ' to upgrade your account.';
                        }
                    }
                    this.loaded = true;
                })
                .catch(error => {
                    if (error) {
                        this.error = 'Unknown error';
                        if (Array.isArray(error.body)) {
                            this.error = error.body.map(e => e.message);
                            alert('1'+this.error);
                        }
                        // UI API DML, Apex and network errors
                        else if (error.body && typeof error.body.message === 'string') {
                            this.error = error.body.message;
                             alert('2'+this.error);
                        }
                        // JS errors
                        else if (typeof error.message === 'string') {
                            this.error = error.message;
                             alert(this.error);
                        }
                        this.NameOfChatStarter = 'None';
                        this.wrapMain = JSON.parse(result);
                        this.wrapMain.isPNA = true;
                        this.wrapMain.strMsg = this.error;
                    }
                    this.loaded = true;
                });
        } else {
            this.wrapMain.isPNA = true;
            this.wrapMain.strMsg = 'Enter Message';
        }
    }

    backToTextManager(event) {
        this.disconnect();
        var self = this;
        this.dispatchEvent(new CustomEvent('clickbackbutton', { detail: self.unReadOnly }));
    }

    connect(currentUserId, organizationId) {
        this.socket1 = new WebSocket(
            "wss://38rwoe2v6a.execute-api.us-east-1.amazonaws.com/production"
        );
        var self = this;
        this.socket1.onopen = function (event) {
            self.sendDummyMessage(currentUserId, organizationId);
        };
        this.socket1.onmessage = function (event) {
            if (event.data != "client details saved successfully.") {
                self.doInIt();
            }
        };

        this.socket1.onerror = function (event) {
            this.wrapMain.strMsg = 'Error Connecting to AWS Web Socket Chat.';
        };

        this.socket1.onclose = function (event) {
        };
    }
    sendDummyMessage(currentUserId, organizationId) {
        var payload = {
            action: "saveclientdetails",
            data: {
                userId: currentUserId,
                organizationId: organizationId,
            },
        };

        try {
            this.socket1.send(JSON.stringify(payload));
        } catch (e) {
            this.wrapMain.strMsg = 'e';
        }
    }

    disconnect() {
        if (this.socket1) {
            this.socket1.close();
            this.isWSConnected1 = false;
        }
    }

    onClearMessage() {
        this.wrapMain.strMsg = '';
    }
}