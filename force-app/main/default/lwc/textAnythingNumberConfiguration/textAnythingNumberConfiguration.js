import { LightningElement, track, api } from 'lwc';
import initNumberConfiguration from '@salesforce/apex/TextAnythingNumberConfiguration.initNumberConfiguration';
import upsertNumberConfig from '@salesforce/apex/TextAnythingNumberConfiguration.upsertNumberConfig';
import deleteNumberConfig from '@salesforce/apex/TextAnythingNumberConfiguration.deleteNumberConfig';
import { loadStyle } from 'lightning/platformResourceLoader';
import CUSTOM_CSS from '@salesforce/resourceUrl/custom_style';

export default class TextAnythingNumberConfiguration extends LightningElement {
    @track lstObjectDetailsWrapper = [{ strObjectName: '-- None --', strObjectAPIName: '', strObject3DigitCode: '', lstFieldDetailWrapper: [] }];
    @track lstField = [{ label: '-- None --', value: '' }];

    @track lstObjectCreateMapping = [{ strObjectName: '-- None --', strObjectAPIName: '', strObject3DigitCode: '', lstFieldDetailWrapper: [] }];
    @track lstFieldCreatedMapping = [{ label: '-- None --', value: '' }];

    @track lstRecords = [];
    @track lstRecordsEmpty = true;
    @track error;
    @track objectValue = "";
    @track fieldValue = "";
    @track objectCode = "";
    @track showMapping = false;
    @track disable = false;
    @track strErrorMsg = "";
    @track strSuccess = "";
    @track strRecordId = "";
    @track loaded = false;
    @track isShowNext = false;
    @track isSetUpWizard = false;
    @api identifylocation;
    @track hasDefaultResults;
    @track cssClass='slds-scrollable_y text cssForWizard';

    connectedCallback() {
        initNumberConfiguration()
            .then(result => {
                if (JSON.parse(result).isSuccess) {
                    for (let i = 0; i < JSON.parse(result).lstObjectDetailWrapper.length; i++) {
                        this.lstObjectDetailsWrapper.push({
                            strObjectName: JSON.parse(result).lstObjectDetailWrapper[i].strObjectName,
                            strObjectAPIName: JSON.parse(result).lstObjectDetailWrapper[i].strObjectAPIName,
                            strObject3DigitCode: JSON.parse(result).lstObjectDetailWrapper[i].strObject3DigitCode,
                            lstFieldDetailWrapper: JSON.parse(result).lstObjectDetailWrapper[i].lstFieldDetailWrapper
                        });
                    }

                    for (let i = 0; i < JSON.parse(result).lstObjectCreatedMapping.length; i++) {
                        this.lstObjectCreateMapping.push({
                            strObjectName: JSON.parse(result).lstObjectCreatedMapping[i].strObjectName,
                            strObjectAPIName: JSON.parse(result).lstObjectCreatedMapping[i].strObjectAPIName,
                            strObject3DigitCode: JSON.parse(result).lstObjectCreatedMapping[i].strObject3DigitCode,
                            lstFieldDetailWrapper: JSON.parse(result).lstObjectCreatedMapping[i].lstFieldDetailWrapper
                        });
                    }

                    if (JSON.parse(result).lstToNumberConfiguration != null && JSON.parse(result).lstToNumberConfiguration != undefined) {
                        for (let i = 0; i < JSON.parse(result).lstToNumberConfiguration.length; i++) {
                            this.lstRecords.push({ isShow: false, ToNumberConfiguration: JSON.parse(result).lstToNumberConfiguration[i] });
                            this.lstRecordsEmpty = false;
                        }

                        this.showMapping = true;
                    } else {
                        this.showMapping = false;
                    }
                    this.loaded = !this.loaded;
                    this.isShowNext = JSON.parse(result).txtAny.Setup_Completed__c;

                    if (this.identifylocation != 'wizard') {
                        this.isShowNext = true;
                        this.cssClass='slds-scrollable_y text cssForMain';
                    }
                } else {
                    this.loaded = !this.loaded;
                    this.strErrorMsg = JSON.parse(result).strMessage;
                }
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
                    this.strErrorMsg = this.error;
                    this.loaded = !this.loaded;
                }
            });
        loadStyle(this, CUSTOM_CSS)
            .then(() => { });
    }

    handleObjectSelect(event) {
        this.loaded = !this.loaded;
        this.objectValue = event.target.value;

        this.lstField = [{ label: '-- None --', value: '' }];
        for (let i = 0; i < this.lstObjectDetailsWrapper.length; i++) {
            if (this.objectValue == this.lstObjectDetailsWrapper[i].strObjectAPIName) {
                if (this.lstObjectDetailsWrapper[i].lstFieldDetailWrapper.length > 0) {
                    for (let j = 0; j < this.lstObjectDetailsWrapper[i].lstFieldDetailWrapper.length; j++) {
                        this.lstField.push({
                            label: this.lstObjectDetailsWrapper[i].lstFieldDetailWrapper[j].strLabel,
                            value: this.lstObjectDetailsWrapper[i].lstFieldDetailWrapper[j].strAPIName
                        });
                    }
                } else {
                    this.lstField = [];
                    this.lstField.push({
                        label: 'Not Found',
                        value: ''
                    });
                }
                this.fieldValue = '';
                this.objectCode = this.lstObjectDetailsWrapper[i].strObject3DigitCode;
            }
        }
        this.loaded = !this.loaded;
    }

    handleFieldSelect(event) {
        this.fieldValue = event.target.value;
    }

    handleNCSave(event) {
        this.onClearMessage();
        this.loaded = !this.loaded;
        if (this.fieldValue && this.objectValue && this.objectCode) {
            this.strErrorMsg = "";
            this.showMapping = true;

            upsertNumberConfig({ objDetalWrapString: JSON.stringify(this.lstObjectDetailsWrapper), fieldApi: this.fieldValue, objApi: this.objectValue, objCode: this.objectCode, editRecordId: this.strRecordId })
                .then(result => {

                    if (JSON.parse(result).isSuccess) {
                        this.lstObjectDetailsWrapper = [{ strObjectName: '-- None --', strObjectAPIName: '', strObject3DigitCode: '', lstFieldDetailWrapper: [] }];
                        for (let i = 0; i < JSON.parse(result).lstObjectDetailWrapper.length; i++) {
                            this.lstObjectDetailsWrapper.push({
                                strObjectName: JSON.parse(result).lstObjectDetailWrapper[i].strObjectName,
                                strObjectAPIName: JSON.parse(result).lstObjectDetailWrapper[i].strObjectAPIName,
                                strObject3DigitCode: JSON.parse(result).lstObjectDetailWrapper[i].strObject3DigitCode,
                                lstFieldDetailWrapper: JSON.parse(result).lstObjectDetailWrapper[i].lstFieldDetailWrapper
                            });
                        }

                        this.lstObjectCreateMapping = [{ strObjectName: '-- None --', strObjectAPIName: '', strObject3DigitCode: '', lstFieldDetailWrapper: [] }];
                        for (let i = 0; i < JSON.parse(result).lstObjectCreatedMapping.length; i++) {
                            this.lstObjectCreateMapping.push({
                                strObjectName: JSON.parse(result).lstObjectCreatedMapping[i].strObjectName,
                                strObjectAPIName: JSON.parse(result).lstObjectCreatedMapping[i].strObjectAPIName,
                                strObject3DigitCode: JSON.parse(result).lstObjectCreatedMapping[i].strObject3DigitCode,
                                lstFieldDetailWrapper: JSON.parse(result).lstObjectCreatedMapping[i].lstFieldDetailWrapper
                            });
                        }

                        this.lstRecords = [];
                        if (JSON.parse(result).lstToNumberConfiguration != null && JSON.parse(result).lstToNumberConfiguration != undefined) {
                            for (let i = 0; i < JSON.parse(result).lstToNumberConfiguration.length; i++) {
                                this.lstRecords.push({ isShow: false, ToNumberConfiguration: JSON.parse(result).lstToNumberConfiguration[i] });
                                this.lstRecordsEmpty = false;
                            }
                            this.showMapping = true;
                        } else {
                            this.showMapping = false;
                        }

                        this.fieldValue = '';
                        this.objectValue = '';
                        this.objectCode = '';
                        this.strRecordId = '';
                        this.disable = false;
                        this.lstField = [{ label: '-- None --', value: '' }];

                        this.isShowNext = JSON.parse(result).txtAny.Setup_Completed__c;
                        if (this.identifylocation != 'wizard') {
                            this.isShowNext = true;
                            this.cssClass='slds-scrollable_y text cssForMain';
                        }
                        if (!this.identifylocation) {
                            this.strSuccess = 'Record Saved Successfully';
                            this.hideSuccessMessage();
                        }
                    } else {
                        this.fieldValue = '';
                        this.objectValue = '';
                        this.objectCode = '';
                        this.strRecordId = '';
                        const selectedObj = this.template.querySelector('[data-id="objOption"]');
                        if (selectedObj) {
                            selectedObj.value = this.objectValue;
                        }
                        this.lstField = [{ label: '-- None --', value: '' }];
                        this.strErrorMsg = JSON.parse(result).strMessage;
                    }
                    this.loaded = !this.loaded;
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
                        this.strErrorMsg = this.error;
                        this.loaded = !this.loaded;
                    }
                });
        }
        else {
            if (!this.objectValue) {
                this.strErrorMsg = "Object is Not Selected";
            }
            else if (!this.fieldValue) {
                this.strErrorMsg = "Phone field is Not Selected";
            }
            else {
                this.strErrorMsg = "";
            }
            this.loaded = !this.loaded;
        }
    }

    handleNCEdit(event) {
        this.onClearMessage();
        this.loaded = !this.loaded;
        this.disable = true;
        this.strRecordId = event.target.value;
        this.hasDefaultResults=null;

        for (let i = 0; i < this.lstRecords.length; i++) {
            if (this.lstRecords[i].ToNumberConfiguration.Id == this.strRecordId) {
                this.objectValue = this.lstRecords[i].ToNumberConfiguration.Object_Name__c;
                this.fieldValue = this.lstRecords[i].ToNumberConfiguration.Field_Name__c;
                this.lstRecords[i].isShow = true;
            } else {
                if (this.lstRecords[i].isShow) {
                    this.lstRecords[i].isShow = false;
                }
            }
        }
        // set field list into select option
        this.lstFieldCreatedMapping = [];
        for (let i = 0; i < this.lstObjectCreateMapping.length; i++) {
            if (this.objectValue == this.lstObjectCreateMapping[i].strObjectAPIName) {
                if (this.lstObjectCreateMapping[i].lstFieldDetailWrapper.length > 0) {
                    for (let j = 0; j < this.lstObjectCreateMapping[i].lstFieldDetailWrapper.length; j++) {
                        if (this.lstObjectCreateMapping[i].lstFieldDetailWrapper[j].strAPIName != this.fieldValue) {
                            this.lstFieldCreatedMapping.push({
                                label: this.lstObjectCreateMapping[i].lstFieldDetailWrapper[j].strLabel,
                                value: this.lstObjectCreateMapping[i].lstFieldDetailWrapper[j].strAPIName
                            });
                        }else{
                            this.hasDefaultResults=this.lstObjectCreateMapping[i].lstFieldDetailWrapper[j]
                        }
                    }
                } else {
                    this.lstFieldCreatedMapping = [];
                    this.lstFieldCreatedMapping.push({
                        label: 'Not Found',
                        value: ''
                    });
                }
                this.objectCode = this.lstObjectCreateMapping[i].strObject3DigitCode;
            }
        }
        /*const selectedVal =this.template.querySelector('[data-name="y"]');*/
        this.loaded = !this.loaded;
    }
    /*
    get hasDefaultResults() {
        //check if array has data
        if (this.lstFieldCreatedMapping.length > 0) {
            //here as an example, i set the second element from 
            //the array as the default, this can be whatever you want
            for (var i in this.lstFieldCreatedMapping) {
                if (this.lstFieldCreatedMapping[i].value == this.fieldValue) {
                    var finalData = this.lstFieldCreatedMapping[i];
                    this.lstFieldCreatedMapping = this.lstFieldCreatedMapping.splice(this.lstFieldCreatedMapping, i);
                    return finalData;
                }

            }

        }
    }
    */
    handleNCCancel(event) {
        this.disable = false;
        this.strRecordId = event.target.value;
        for (let i = 0; i < this.lstRecords.length; i++) {
            if (this.lstRecords[i].ToNumberConfiguration.Id == this.strRecordId) {
                this.lstRecords[i].isShow = false;
            }
        }
    }

    handleNCDelete(event) {
        this.onClearMessage();
        this.loaded = !this.loaded;
        deleteNumberConfig({ objDetalWrapString: JSON.stringify(this.lstObjectDetailsWrapper), recId: event.target.value })
            .then(result => {
                if (JSON.parse(result).isSuccess) {
                    this.lstObjectDetailsWrapper = [{ strObjectName: '-- None --', strObjectAPIName: '', strObject3DigitCode: '', lstFieldDetailWrapper: [] }];
                    for (let i = 0; i < JSON.parse(result).lstObjectDetailWrapper.length; i++) {
                        this.lstObjectDetailsWrapper.push({
                            strObjectName: JSON.parse(result).lstObjectDetailWrapper[i].strObjectName,
                            strObjectAPIName: JSON.parse(result).lstObjectDetailWrapper[i].strObjectAPIName,
                            strObject3DigitCode: JSON.parse(result).lstObjectDetailWrapper[i].strObject3DigitCode,
                            lstFieldDetailWrapper: JSON.parse(result).lstObjectDetailWrapper[i].lstFieldDetailWrapper
                        });
                    }

                    this.lstObjectCreateMapping = [{ strObjectName: '-- None --', strObjectAPIName: '', strObject3DigitCode: '', lstFieldDetailWrapper: [] }];
                    for (let i = 0; i < JSON.parse(result).lstObjectCreatedMapping.length; i++) {
                        this.lstObjectCreateMapping.push({
                            strObjectName: JSON.parse(result).lstObjectCreatedMapping[i].strObjectName,
                            strObjectAPIName: JSON.parse(result).lstObjectCreatedMapping[i].strObjectAPIName,
                            strObject3DigitCode: JSON.parse(result).lstObjectCreatedMapping[i].strObject3DigitCode,
                            lstFieldDetailWrapper: JSON.parse(result).lstObjectCreatedMapping[i].lstFieldDetailWrapper
                        });
                    }

                    this.lstRecords = [];
                    if (JSON.parse(result).lstToNumberConfiguration != null && JSON.parse(result).lstToNumberConfiguration != undefined) {
                        for (let i = 0; i < JSON.parse(result).lstToNumberConfiguration.length; i++) {
                            this.lstRecords.push({ isShow: false, ToNumberConfiguration: JSON.parse(result).lstToNumberConfiguration[i] });
                        }
                        this.showMapping = true;
                    } else {
                        this.showMapping = false;
                    }
                    if (this.lstRecords && this.lstRecords.length > 0) {
                        this.lstRecordsEmpty = false;
                    } else {
                        this.lstRecordsEmpty = true;
                    }
                    this.isShowNext = JSON.parse(result).txtAny.Setup_Completed__c;

                    if (this.identifylocation != 'wizard') {
                        this.isShowNext = true;
                        this.cssClass='slds-scrollable_y text cssForMain';
                    }

                    if (!this.identifylocation) {
                        this.strSuccess = 'Record Deleted Successfully';
                        this.hideSuccessMessage();
                    }
                } else {
                    this.strErrorMsg = JSON.parse(result).strMessage;
                }
                this.loaded = !this.loaded;
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
                    this.loaded = !this.loaded;
                    this.strErrorMsg = this.error;
                }
            });

        this.strRecordId = '';
        this.fieldValue = "";
        this.objectCode = '';
        this.objectValue = "";
        this.lstField = [{ label: '-- None --', value: '' }];
    }

    handleNCClear() {
        this.onClearMessage();
        this.loaded = !this.loaded;
        this.strRecordId = '';
        this.fieldValue = "";
        this.objectCode = '';
        this.objectValue = "";
        const selectedObj = this.template.querySelector('[data-id="objOption"]');
        if (selectedObj) {
            selectedObj.value = this.objectValue;
        }
        this.lstField = [{ label: '-- None --', value: '' }];
        this.loaded = !this.loaded;
    }

    handleNumberConfigurationNext() {

        if (this.lstRecords != null && this.lstRecords.length > 0) {
            this.dispatchEvent(new CustomEvent('ncnotification'));
        }
        else {
            this.strErrorMsg = "You must specify at least one To Number in order to be able to send text messages.";
        }
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