import { LightningElement, track, api, wire } from 'lwc';
import getSetupWiz from '@salesforce/apex/TextAnythingSetupWizard.getSetupWiz';
import updateSetupWiz from '@salesforce/apex/TextAnythingSetupWizard.updateSetupWiz';
import findUsers from '@salesforce/apex/TextAnythingSetupWizard.findUsers';
import getUserName from '@salesforce/apex/TextAnythingSetupWizard.getUserName';
const DELAY = 350;

export default class TextAnythingMessageOwnership extends LightningElement {

    @track value;
    @track valuerr = 'Lead';
    @track error = '';
    @api showwizard = false;
    @track showUserSearch = false;
    @track selectedUserName = '';
    @track selectedUserId = '';
    @track showList = false;
    @track disable;
    @track objWarp = { isSuccess: '', strMessage: '', objTAS: '' };
    users;
    @track strErrorMsg = "";
    @track strSuccess = "";
    @track loaded = false;
    @api identifylocation;

    hideSuccessMessage() {
        setTimeout(() => {
            this.strSuccess = "";
        }, 5000);
    }

    connectedCallback() {
        if (this.identifylocation != 'wizard') {
            this.loaded = true;
        }
        this.disable = !this.showwizard;
        getSetupWiz()
            .then(result => {
                if (JSON.parse(result).isSuccess) {

                    this.objWarp.isSuccess = JSON.parse(result).isSuccess;
                    this.objWarp.strMessage = JSON.parse(result).strMessage;
                    this.objWarp.objTAS = JSON.parse(result).objTAS;
                    this.value = this.objWarp.objTAS.Record_Ownership__c;
                    this.valuerr = this.objWarp.objTAS.Default_Related_Record__c;
                    if (this.value == 'Default User') {
                        getUserName({ strId: this.objWarp.objTAS.Default_user_Id__c })
                            .then(result => {
                                this.selectedUserName = result;
                                this.showUserSearch = true;
                            })
                            .catch(error => {
                                this.error = error;
                            });
                    }

                    if (this.identifylocation == 'wizard') {
                        this.loaded = !this.loaded;
                    }
                }
                else {
                    this.error = JSON.parse(result).strMessage;
                    this.strErrorMsg = this.error;
                    if (this.identifylocation == 'wizard') {
                        this.loaded = !this.loaded;
                    }
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
                if (this.identifylocation == 'wizard') {
                    this.loaded = !this.loaded;
                }
            });
    }
    get options() {
        return [
            { label: 'The user who creates the message (default)', value: 'Running User' },
            { label: 'The record owner', value: 'Parent Record Owner' }
        ];
    }

    get optionsrr() {
        return [
            { label: 'Create a lead', value: 'Lead' },
            { label: 'Create a contact', value: 'Contact' },
        ];
    }

    handleChangeMO(event) {
        debugger;
        this.value = event.detail.value;
        this.objWarp.objTAS.Record_Ownership__c = this.value;
        if (this.value == 'Default User') {
            this.showUserSearch = true;
        }
        else {
            this.showUserSearch = false;
            this.selectedUserName = '';
            this.selectedUserId = '';
        }
    }

    handleKeyChange(event) {
        if (event.target.value) {
            window.clearTimeout(this.delayTimeout);
            const searchKey = event.target.value;
            this.delayTimeout = setTimeout(() => {
                findUsers({ searchKey })
                    .then(result => {
                        this.showList = true;
                        this.users = result;
                        this.error = undefined;
                    })
                    .catch(error => {
                        this.error = error;
                        this.users = undefined;
                    });
            }, DELAY);
        }
        else {
            this.showList = false;
        }
    }

    handleLISelect(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.id;
        this.selectedUserId = id;
        const name = event.currentTarget.dataset.name;
        this.showList = false;
        this.selectedUserName = name;
        this.objWarp.objTAS.Default_user_Id__c = this.selectedUserId;
    }

    handleChangeRRMO(event) {
        this.valuerr = event.detail.value;
        this.objWarp.objTAS.Default_Related_Record__c = this.valuerr;
    }

    handleMessageOwnershipNext(event) {
        this.objWarp.objTAS.Current_Step__c = "4";
        this.updateSetup(JSON.stringify(this.objWarp));
        if (this.objWarp.isSuccess) {
            this.dispatchEvent(new CustomEvent('monotification'));
        }
    }
    handleMessageOwnershipEdit(event) {
        this.disable = false;
    }
    handleMessageOwnershipSave(event) {

        this.updateSetup(JSON.stringify(this.objWarp));
        if (this.objWarp.isSuccess) {
            this.disable = true;
            this.strSuccess = 'Updated Successfully';
            this.hideSuccessMessage();
        }
    }

    handleMessageOwnershipCancel(event) {
        this.onClearMessage();
        getSetupWiz()
            .then(result => {
                if (JSON.parse(result).isSuccess) {

                    this.objWarp.isSuccess = JSON.parse(result).isSuccess;
                    this.objWarp.strMessage = JSON.parse(result).strMessage;
                    this.objWarp.objTAS = JSON.parse(result).objTAS;
                    this.value = this.objWarp.objTAS.Record_Ownership__c;
                    this.valuerr = this.objWarp.objTAS.Default_Related_Record__c;
                    this.disable = true;
                    if (this.value == 'Default User') {
                        getUserName({ strId: this.objWarp.objTAS.Default_user_Id__c })
                            .then(result => {
                                this.selectedUserName = result;
                                this.showUserSearch = true;
                            })
                            .catch(error => {
                                this.error = error;
                            });

                    }
                    else {
                        this.showUserSearch = false;
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

    updateSetup(strObjWarp) {
        this.onClearMessage();
        updateSetupWiz({ strLWCWarp: strObjWarp })
            .then(result => {
                if (JSON.parse(result).isSuccess) {
                    this.objWarp.isSuccess = JSON.parse(result).isSuccess;
                    this.objWarp.strMessage = JSON.parse(result).strMessage;
                    this.objWarp.objTAS = JSON.parse(result).objTAS;
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

    onClearMessage() {
        this.strErrorMsg = '';
        this.strSuccess = '';
    }
}