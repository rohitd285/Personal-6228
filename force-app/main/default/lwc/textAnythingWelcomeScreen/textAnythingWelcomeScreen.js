import { LightningElement, track, api } from 'lwc';
import getSetupWiz from '@salesforce/apex/TextAnythingSetupWizard.getSetupWiz';
import getTestNumber from '@salesforce/apex/TextAnythingSetupWizard.getTestNumber';
import updateWizStep from '@salesforce/apex/TextAnythingSetupWizard.updateWizStep';
import callAwsToCreateSubAccount from '@salesforce/apex/TextAnythingRestApi.callAwsToCreateSubAccount';
import { loadStyle } from 'lightning/platformResourceLoader';
import CUSTOM_CSS from '@salesforce/resourceUrl/custom_style';

export default class TextAnythingWelcomeScreen extends LightningElement {
    @track label = "";
    @track showStep1 = false;
    @track showSpinner = false;
    @track showStep2 = false;
    @api step;
    @track freeNumber = '';
    @track trialMessage = '';
    @track objWarp = { isSuccess: '', strMessage: '', objTAS: '' };
    @track tosValue = false;
    @track tosIsFalse = true;
    @track strErrorMsg = "";




    connectedCallback() {
        if (this.step == '1') {
            this.showStep1 = true;
            this.showSpinner = false;
            this.showStep2 = false;
        }
        else {
            this.showStep1 = false;
            this.showSpinner = true;
            this.showStep2 = false;
        }
        if (this.step == '2') {
            this.showStep1 = false;
            this.showSpinner = false;
            this.showStep2 = true;
        }

        getSetupWiz()
            .then(result => {
                if (JSON.parse(result).isSuccess) {
                    this.label=JSON.parse(result).termAndCondition;
                    this.objWarp.isSuccess = JSON.parse(result).isSuccess;
                    this.objWarp.strMessage = JSON.parse(result).strMessage;
                    this.objWarp.objTAS = JSON.parse(result).objTAS;
                    if (this.objWarp.objTAS != null) {
                        if (this.objWarp.objTAS.Current_Step__c == '2') {
                            getTestNumber()
                                .then(result => {
                                    this.freeNumber = result;
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
                    }

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

        loadStyle(this, CUSTOM_CSS)
            .then(() => { });
    }


    handleClickOneA(event) {
        this.onClearMessage();
        this.showStep1 = false;
        this.showSpinner = true;
        callAwsToCreateSubAccount()
            .then(result => {
                if (JSON.parse(result).success) {
                    this.freeNumber = JSON.parse(result).data;
                    this.trialMessage = JSON.parse(result).strMssage;
                    updateWizStep({ strStep: '2', isComplete: false })
                        .then(result => {
                            if (JSON.parse(result).isSuccess) {
                                this.objWarp.isSuccess = JSON.parse(result).isSuccess;
                                this.objWarp.strMessage = JSON.parse(result).strMessage;
                                this.objWarp.objTAS = JSON.parse(result).objTAS;
                                this.step = this.objWarp.objTAS.Current_Step__c;
                                this.showStep1 = false;
                                this.showSpinner = false;
                                this.showStep2 = true;

                                this.dispatchEvent(new CustomEvent('createsubaccount'));
                            }
                            else {
                                this.error = JSON.parse(result).strMssage;
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
                    this.showStep1 = true;
                    this.showSpinner = false;
                    this.showStep2 = false;
                    this.error = JSON.parse(result).strMssage;
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
                this.showStep1 = true;
                this.showSpinner = false;
                this.showStep2 = false;
                this.strErrorMsg = this.error;
            });
    }

    handleWelcomeScreenNext(event) {
        this.onClearMessage();
        //We Call Two Api One For Creating Sub-Account Other One Is For Buy A Number
        this.showStep1 = false;
        this.showSpinner = false;
        this.showStep2 = false;
        this.dispatchEvent(new CustomEvent('wsnotification'));
    }

    handleWSCBChange(event) {
        if (event.target.checked) {
            this.tosIsFalse = false;
            this.tosValue = true;
        }
        else {
            this.tosIsFalse = true;
            this.tosValue = false;
        }
    }

    onClearMessage() {
        this.strErrorMsg = '';
    }
}