import { LightningElement, track, api } from 'lwc';
import sendDemoSMS from '@salesforce/apex/TextAnythingSetupWizard.sendDemoSMS';

export default class TextAnythingSendDemoSms extends LightningElement {
    @track mobile;
    @track strMessageBody;
    @track error;
    @track strErrorMsg = "";
    @track strSuccess = "";

    onChangeHandler(event) {
        this[event.target.name] = event.target.value;
    }

    onMessageChangeHandler(event) {
        this.strMessageBody = event.target.value;
    }

    handleTest(event) {
         this.onClearMessage();
        var allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);
        debugger;
        if (this.strMessageBody != null && this.strMessageBody.trim() != '' && this.strMessageBody.length < 256) {
            allValid = true;
        }
        else {
            allValid = false;
        }
        
        if (allValid) {
            sendDemoSMS({ strToNum: this.mobile, strMessageBody: this.strMessageBody })
                .then(result => {
                    this.mobile='';
                    this.strMessageBody='';
                    if (JSON.parse(result).isSuccess) {
                        this.strSuccess = JSON.parse(result).strMessage;
                         this.hideSuccessMessage();
                        
                    }
                    else {
                        this.error = JSON.parse(result).strMessage;
                        this.strErrorMsg = this.error;
                    }
                })
                .catch(error => {
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
                    this.strErrorMsg = this.error;
                });
        }
        else {
            this.error = 'Please update the invalid form entries and try again.';
            this.strErrorMsg = this.error;
        }
    }

    handleCloseWizard(event) {
         this.onClearMessage();
        this.dispatchEvent(new CustomEvent('cwnotification'));
    }

    onClearMessage() {
        this.strErrorMsg = '';
        this.strSuccess = '';
    }
    hideSuccessMessage() {
        setTimeout(() => {
            this.strSuccess = "";
        }, 5000);
    }
}