import { LightningElement, api, track } from 'lwc';
import callAwsToReleaseNumber from '@salesforce/apex/TextAnythingRestApi.callAwsToReleaseNumber';
import initTextAnythingReleaseNumberVFController from '@salesforce/apex/TextAnythingReleaseNumberVFController.initTextAnythingReleaseNumberVFController';
import { loadStyle } from 'lightning/platformResourceLoader';
import CUSTOM_CSS from '@salesforce/resourceUrl/custom_style';
import { NavigationMixin } from 'lightning/navigation';
export default class TextAnythingReleasePurchaseNumber extends NavigationMixin(LightningElement) {

    @api recordId;
    @track number = '';
    @track error = '';
    @track strErrorMsg = '';
    @track strSuccess = '';

    connectedCallback() {
        initTextAnythingReleaseNumberVFController({ currentId: this.recordId })
            .then(result => {
                if (result) {
                    this.number = result;
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

        loadStyle(this, CUSTOM_CSS)
            .then(() => { });
    }

    handleRelease() {
        this.onClearMessage();
        callAwsToReleaseNumber({ strNumber: this.number })
            .then(result => {
                if (JSON.parse(result).success) {
                    this.strSuccess = JSON.parse(result).strMssage;
                    this.dispatchEvent(new CustomEvent('close'));
                    eval("$A.get('e.force:refreshView').fire();");
                    this.hideSuccessMessage();
                }
                else {
                    this.strErrorMsg = JSON.parse(result).strMssage;
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

    closeLwcModal(event) {
        this.onClearMessage();
        this.dispatchEvent(new CustomEvent('close'));
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