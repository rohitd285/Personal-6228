import { LightningElement, track, api } from 'lwc';
import getSetupWiz from '@salesforce/apex/TextAnythingSetupWizard.getSetupWiz';
import updateWizStep from '@salesforce/apex/TextAnythingSetupWizard.updateWizStep';
import createSetupWiz from '@salesforce/apex/TextAnythingSetupWizard.createSetupWiz';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TextAnythingSetupWizard extends LightningElement {

    @api setup;
    @track currentsStep = '1';
    @track error;
    @track showStep = '1';
    @track showStep1And2 = false;
    @track showStep3 = false;
    @track showStep4 = false;
	@track showStep5And6 = false;
    @track showStep7 = false;
    @track showWizard = true;
    @track objWarp = { isSuccess: '', strMessage: '', objTAS: '' };

    showToast(title, msg, typeOfToast) {
        const eve = new ShowToastEvent({
            title: title,
            message: msg,
            variant: typeOfToast,
        });
        this.dispatchEvent(eve);
    }

    connectedCallback() {
        getSetupWiz()
            .then(result => {
                if (JSON.parse(result).isSuccess) {

                    this.objWarp.isSuccess = JSON.parse(result).isSuccess;
                    this.objWarp.strMessage = JSON.parse(result).strMessage;
                    this.objWarp.objTAS = JSON.parse(result).objTAS;
                    if (this.objWarp.objTAS == null) {
                        createSetupWiz()
                            .then(result => {
                                if (JSON.parse(result).isSuccess) {
                                    this.objWarp.isSuccess = JSON.parse(result).isSuccess;
                                    this.objWarp.strMessage = JSON.parse(result).strMessage;
                                    this.objWarp.objTAS = JSON.parse(result).objTAS;
                                }
                                else {
                                    this.error = JSON.parse(result).strMessage;
                                    this.showToast('Error', this.error, 'error');
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
                                this.showToast('Error', this.error, 'error');
                            });
                    }
                    else {
                        this.currentsStep = this.objWarp.objTAS.Current_Step__c;
                    }

                    if (this.currentsStep == '1' || this.currentsStep == '2') {
                        this.showStep1And2 = true;
                        if (this.currentsStep == '1') {
                            this.showStep = '1';
                        }
                        else {
                            this.showStep = '2';
                        }
                    }
                    else if (this.currentsStep == '3') {
                        this.showStep3 = true;
                        this.showStep = '3';
                    }
                    else if (this.currentsStep == '4') {
                        this.showStep4 = true;
                        this.showStep = '4';
                    }
                    else if ( this.currentsStep == '5' || this.currentsStep == '6') {
                        this.showStep5And6 = true;
                        if ( this.currentsStep == '5') {
                            this.showStep = '5';
                        }
                        else {
                            this.showStep = '6';
                        }
                    }
                    else if (this.currentsStep == '7') {
                        this.showStep7 = true;
                        this.showStep = '7';
                    }

                }
                else {
                    this.error = JSON.parse(result).strMessage;
                    this.showToast('Error', this.error, 'error');
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
                this.showToast('Error', this.error, 'error');
            });
    }

    handleCreateAWSSubAccount() {
        this.currentsStep = "2";
        this.showStep = '2';
        this.objWarp.objTAS.Current_Step__c = '2';
        this.updateStep(this.currentsStep, false);
    }

    handleWelcomeScreenNext() {
        this.showStep1And2 = false;
        this.showStep3 = true;
        this.currentsStep = "3";
        this.objWarp.objTAS.Current_Step__c = this.currentsStep;
        this.updateStep(this.currentsStep, false);
    }

    handleMessageOwnershipNext() {
        this.showStep1And2 = false;
        this.showStep3 = false;
        this.showStep4 = true;
        this.currentsStep = "4";
        this.showStep = '4';
    }

    handleNumberConfigurationNext() {
        this.showStep1And2 = false;
        this.showStep3 = false;
        this.showStep4 = false;
        this.showStep5And6 = true;
        //Changes Made we need to skip 4A step
        this.currentsStep = "5";
        this.updateStep(this.currentsStep, false);
    }

    handleIntegrationUserCredNext() {
        this.showStep1And2 = false;
        this.showStep3 = false;
        this.showStep4 = false;
        this.showStep5And6 = true;
        this.currentsStep = "6";
        this.updateStep(this.currentsStep, false);
    }

    handleIntegrationUserNext() {
        this.showStep1And2 = false;
        this.showStep3 = false;
        this.showStep4 = false;
        this.showStep5And6 = false;
        this.showStep7 = true;
        this.currentsStep = "7";
        this.updateStep(this.currentsStep, false);
    }

    handleCloseWizard() {
        this.showWizard = false;
        if (this.currentsStep == '7')
            this.currentsStep = '7';
        this.updateStep(this.currentsStep, true);
        this.dispatchEvent(new CustomEvent('cwpnotification'));
    }


    updateStep(strStep, boolComplete) {
        updateWizStep({ strStep: strStep, isComplete: boolComplete })
            .then(result => {
                if (JSON.parse(result).isSuccess) {

                    this.objWarp.isSuccess = JSON.parse(result).isSuccess;
                    this.objWarp.strMessage = JSON.parse(result).strMessage;
                    this.objWarp.objTAS = JSON.parse(result).objTAS;
                    this.currentsStep = this.objWarp.objTAS.Current_Step__c;

                    if (this.currentsStep == '1' || this.currentsStep == '2') {
                        this.showStep1And2 = true;
                        if (this.currentsStep == '1') {
                            this.showStep = '1';
                        }
                        else {
                            this.showStep = '2';
                        }
                    }
                    else if (this.currentsStep == '3') {
                        this.showStep3 = true;
                        this.showStep = '3';
                    }
                    else if (this.currentsStep == '4') {
                        this.showStep4 = true;
                        this.showStep = '4';
                    }
                    else if ( this.currentsStep == '5' || this.currentsStep == '6') {
                        this.showStep5And6 = true;
                        if ( this.currentsStep == '5') {
                            this.showStep = '5';
                        }
                        else {
                            this.showStep = '6';
                        }
                    }
                    else if (this.currentsStep == '7') {
                        this.showStep7 = true;
                        this.showStep = '7';
                    }
                }
                else {
                    this.error = JSON.parse(result).strMessage;
                    this.showToast('Error', this.error, 'error');
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
                this.showToast('Error', this.error, 'error');
            });
    }
}