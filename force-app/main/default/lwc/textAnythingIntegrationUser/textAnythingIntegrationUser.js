import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getSetupWiz from '@salesforce/apex/TextAnythingSetupWizard.getSetupWiz';
import updateSetupWiz from '@salesforce/apex/TextAnythingSetupWizard.updateSetupWiz';
import callOAuthFlow from '@salesforce/apex/TextAnythingRestApi.callOAuthFlow';
import helpTextUserCredentialsR from '@salesforce/resourceUrl/helpTextUserCredentials';
import getHelpPageURL from '@salesforce/apex/TextAnythingSetupWizard.getHelpPageURL';

export default class TextAnythingIntegrationUser extends LightningElement {
    @track objWarp = { isSuccess: '', strMessage: '', objTAS: '' };
    @track valueIU = 'iuoption1';
    @track showStep5 = false;
    @track showStep6 = false;
    @track userName = '';
    @track password = '';
    @track token = '';
    @track showWarning = false;
    @track error = '';
    @track strErrorMsg = "";
    @track strSuccess = "";
    @api step;
    @api identifylocation;
    @api showwizard = false;
    @track disable;
    @track isDisable = true;
    @track displayhelptext1 = false;
    @track displayhelptext2 = false;
    @track helpTextUserCredentials = helpTextUserCredentialsR;

    connectedCallback() {
        this.disable = !this.showwizard;
        this.showStep(this.step);
        getSetupWiz()
            .then(result => {
                if (JSON.parse(result).isSuccess) {
                    this.objWarp.isSuccess = JSON.parse(result).isSuccess;
                    this.objWarp.strMessage = JSON.parse(result).strMessage;
                    this.objWarp.objTAS = JSON.parse(result).objTAS;
                    this.userName = this.objWarp.objTAS.SF_Username__c;
                    this.password = this.objWarp.objTAS.SF_Password__c;
                    this.token = this.objWarp.objTAS.SF_Security_Token__c;
                    if (this.userName && this.password && this.token) {
                        this.isDisable = true;
                    } else {
                        this.isDisable = false;
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
    }

    get optionsIU() {
        return [
            { label: 'My account', value: 'iuoption1' },
            { label: 'A dedicated integration user', value: 'iuoption2' },
        ];
    }

    handleChangeIU(event) {
        this.valueIU = event.detail.value;
    }

    onChangeHandler(event) {
        this[event.target.name] = event.target.value;
    }

    handleMainNext(event) {
        if (this.valueIU == 'iuoption1') {
            this.objWarp.objTAS.Current_Step__c = '5';
            this.updateSetup();
            this.showStep(this.objWarp.objTAS.Current_Step__c);
        }
        else if (this.valueIU == 'iuoption2') {
            this.objWarp.objTAS.Current_Step__c = '6';
            this.updateSetup();
            this.showStep(this.objWarp.objTAS.Current_Step__c);
        }
        else {
            this.showStep6 = true;
        }
    }

    handleConnectMyAccount(event) {
        /*this[NavigationMixin.Navigate]({
            type: 'standard_webPage',
            attribute:{
                url:""
            }
        })*/
    }

    handleChildOneNext(event) {
        this.objWarp.objTAS.Current_Step__c = '6';
        this.updateSetup();
        this.showStep(this.objWarp.objTAS.Current_Step__c);
    }

    handleChildTwoNext(event) {
        this.onClearMessage();
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);
        if (allValid) {
            callOAuthFlow({ strUserName: this.userName, strPassword: this.password, strToken: this.token })
                .then(result => {
                    const msg = JSON.parse(result).strMssage;
                    if (JSON.parse(result).success) {
                        this.objWarp.objTAS.SF_Username__c = this.userName;
                        this.objWarp.objTAS.SF_Password__c = this.password;
                        this.objWarp.objTAS.SF_Security_Token__c = this.token;
                        this.objWarp.objTAS.Current_Step__c = '6';
                        this.isDisable = true;
                        this.updateSetup();
                        this.showStep(this.objWarp.objTAS.Current_Step__c);
                        this.handleIntegrationUserCredNext(event);
                        if (this.objWarp.isSuccess) {
                            if (!this.identifylocation) {
                                this.strSuccess = msg;
                                this.hideSuccessMessage();
                            }
                        }
                    }
                    else {
                        this.strErrorMsg = msg;
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

    handleChildTwoEdit(event) {
        this.disable = false;
    }

    handleChildTwoCancel(event) {
        this.disable = !this.disable;
        this.userName = this.objWarp.objTAS.SF_Username__c;
        this.password = this.objWarp.objTAS.SF_Password__c;
        this.token = this.objWarp.objTAS.SF_Security_Token__c;
    }

    handleChildTwoSave(event) {
        this.onClearMessage();
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);
        if (allValid) {
            this.onClearMessage();
            callOAuthFlow({ strUserName: this.userName, strPassword: this.password, strToken: this.token })
                .then(result => {
                    const msg = JSON.parse(result).strMssage;
                    if (JSON.parse(result).success) {
                        this.objWarp.objTAS.SF_Username__c = this.userName;
                        this.objWarp.objTAS.SF_Password__c = this.password;
                        this.objWarp.objTAS.SF_Security_Token__c = this.token;
                        this.updateSetup();
                        if (this.objWarp.isSuccess) {
                            this.disable = true;
                            if (!this.identifylocation) {
                                this.strSuccess = msg;
                                this.hideSuccessMessage();
                            }
                        }
                    }
                    else {
                        this.strErrorMsg = msg;
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
    }

    handleSkip(event) {
        this.showWarning = true;
    }

    handleSkipYes(event) {
        this.objWarp.objTAS.Current_Step__c = '6';
        this.isDisable = true;
        this.updateSetup();
        this.showStep(this.objWarp.objTAS.Current_Step__c);
        this.handleIntegrationUserCredNext(event);
    }

    handleSkipNo(event) {
        this.showWarning = false;
    }

    handleIntegrationUserCredNext(event) {
        this.strErrorMsg = "";
        this.strSuccess = "";
        this.dispatchEvent(new CustomEvent('crednext'));
    }

    handleIntegrationUserNext(event) {
        this.strErrorMsg = "";
        this.strSuccess = "";
        this.dispatchEvent(new CustomEvent('iunotification'));
    }

    handleCloseWizard(event) {
        this.strErrorMsg = "";
        this.strSuccess = "";
        this.dispatchEvent(new CustomEvent('cwiunotification'));
    }

    showStep(step) {
        if (step == '5') {
            this.showStep5 = true;
            this.showStep6 = false;


        }
        else if (step == '6') {
            this.showStep6 = true;
            this.showStep5 = false;


        }
    }

    updateSetup() {
        this.onClearMessage();
        updateSetupWiz({ strLWCWarp: JSON.stringify(this.objWarp) })
            .then(result => {
                if (JSON.parse(result).isSuccess) {
                    this.objWarp.isSuccess = JSON.parse(result).isSuccess;
                    this.objWarp.strMessage = JSON.parse(result).strMessage;
                    this.objWarp.objTAS = JSON.parse(result).objTAS;
                    this.step = this.objWarp.objTAS.Current_Step__c;
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

    hoverOpenPop1() {
        this.displayhelptext1 = true;
    }

    hoverClosePop1() {
        this.displayhelptext1 = false;
    }
    hoverOpenPop2() {
        this.displayhelptext2 = true;
    }

    hoverClosePop2() {
        this.displayhelptext2 = false;
    }

    handleClickHelpURL(event) {
        getHelpPageURL({ type: event.target.name })
            .then(result => {
                window.open(result, "_BLANK")
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