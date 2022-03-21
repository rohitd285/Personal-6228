import { LightningElement, track } from 'lwc';
import TextAnythingPurchaseNumberController from '@salesforce/apex/TextAnythingPurchaseNumberController.initTextAnythingPurchaseNumberController';
import searchPhoneNumber from '@salesforce/apex/TextAnythingPurchaseNumberController.searchPhoneNumber';
import buyPhoneNumber from '@salesforce/apex/TextAnythingPurchaseNumberController.buyPhoneNumber';
import { NavigationMixin } from 'lightning/navigation';
import { loadStyle } from 'lightning/platformResourceLoader';
import CUSTOM_CSS from '@salesforce/resourceUrl/custom_style';

export default class TextAnythingBuyPhoneNumber extends NavigationMixin(LightningElement) {

    @track isSetUpCompleted=false;
    @track wrapMain = new Object();
    @track textValue = '';
    @track isBuy = false;
    @track phoneText = '';
    @track friendlyName = '';
    @track fee = '';
    @track facility = '';
    @track isShowTable = false;
    @track isMatch = false;
    @track loaded = false;
    @track strErrorMsg = "";
    @track strSuccess = "";
    @track strModalErrorMsg = "";
    @track NumLoc = [
        {
            label: 'Number',
            value: 'Number'
        },
        {
            label: 'Locality',
            value: 'Locality'
        }
    ];

    @track match = [
        {
            label: 'First Part of Number',
            value: 'First Part of Number'
        },
        {
            label: 'Anywhere in Number',
            value: 'Anywhere in Number'
        }
    ];

    onClearMessage() {
        this.strErrorMsg = '';
        this.strSuccess = '';
        this.strModalErrorMsg = '';
        if(this.isSetUpCompleted==false)
        {
            this.handleClickCancel(event);
        }
    }
    hideSuccessMessage() {
        setTimeout(() => {
            this.strSuccess = "";
        }, 5000);
    }

    connectedCallback() {
        TextAnythingPurchaseNumberController()
            .then(result => {
                if (JSON.parse(result).isSuccess) {
                    this.wrapMain = JSON.parse(result);
                    this.wrapMain.strSearchType = 'Number';
                    this.wrapMain.matchString = 'First Part of Number';
                    this.loaded = !this.loaded;
                    this.isSetUpCompleted=JSON.parse(result).isSetUpCompleted;
                } else {
                    this.strErrorMsg = JSON.parse(result).strMsg;
                    this.loaded = !this.loaded;
                    this.isSetUpCompleted=JSON.parse(result).isSetUpCompleted;
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

    handleCountry(event) {
        this.wrapMain.countrySelected = event.target.value;
    }

    handleMatch(event) {
        this.wrapMain.matchString = event.target.value;
    }

    handleTollFreeChange(event) {
        this.wrapMain.isTollFree = event.target.checked;
    }

    handleNumLoc(event) {
        this.wrapMain.strSearchType = event.target.value;
        if (this.wrapMain.strSearchType == 'Locality') {
            this.isMatch = true;
        } else {
            this.isMatch = false;
        }
        this.textValue = '';
    }

    handelKeySearch(event) {
        this.textValue = event.target.value;
    }

    handleCancel(event) {
        this.onClearMessage();
        this.isBuy = false;
        this.wrapMain.strSearchType = 'Number';
        this.wrapMain.matchString = 'First Part of Number';
        this.phoneText = '';
        this.fee = '';
        this.facility = '';
        this.friendlyName = '';
    }

    handleBuy(event) {
        this.onClearMessage();
        if (this.phoneText != null && this.phoneText != '' && this.phoneText != undefined) {
            this.loaded = !this.loaded;
            buyPhoneNumber({ wrapString: JSON.stringify(this.wrapMain), phoneNumber: this.phoneText, frndName: this.friendlyName })
                .then(result => {
                    if (JSON.parse(result).isSuccess) {
                        this.wrapMain = JSON.parse(result);
                        this.wrapMain.strSearchType = 'Number';
                        this.wrapMain.matchString = 'First Part of Number';
                        for (let i = 0; i < this.wrapMain.lstSearchNumberList.length; i++) {

                            if (this.wrapMain.lstSearchNumberList[i].PhoneNumber == this.phoneText) {
                                this.wrapMain.lstSearchNumberList.splice(i, 1);
                            }
                        }
                        this.phoneText = '';
                        this.friendlyName = '';
                        this.fee = '';
                        this.facility = '';
                        this.isBuy = false;
                        this.dispatchEvent(new CustomEvent('refreshtablechild'));
                        this.strSuccess = JSON.parse(result).strMsg;
                        this.loaded = !this.loaded;
                        this.hideSuccessMessage();
                    } else {
                        this.strModalErrorMsg = JSON.parse(result).strMsg;
                        this.loaded = !this.loaded;
                    }
                })
                .catch(error => {
                    this.isBuy = false;
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
                        this.strModalErrorMsg = this.error;
                    }
                    this.loaded = !this.loaded;
                });
        }
    }

    purchseThisNumber(event) {
        this.onClearMessage();
        const PN = event.target.value;

        if (PN != null && PN != '' && PN != undefined) {

            if (this.wrapMain.lstSearchNumberList.length > 0) {
                for (let i = 0; i < this.wrapMain.lstSearchNumberList.length; i++) {

                    if (this.wrapMain.lstSearchNumberList[i].PhoneNumber == PN) {
                        this.phoneText = this.wrapMain.lstSearchNumberList[i].PhoneNumber;
                        this.friendlyName = this.wrapMain.lstSearchNumberList[i].friendlyName;
                        this.fee = this.wrapMain.lstSearchNumberList[i].MonthlyFee;
                        this.facility = this.wrapMain.lstSearchNumberList[i].features;
                        this.isBuy = true;
                    }
                }
            }
        }
    }

    handleSearch(event) {
        this.onClearMessage();
        if (this.textValue != null && this.textValue != undefined && this.textValue != '' && this.textValue.trim() != '') {
            this.loaded = !this.loaded;
            searchPhoneNumber({ wrapString: JSON.stringify(this.wrapMain), queryText: this.textValue })
                .then(result => {
                    if (JSON.parse(result).isSuccess) {
                        this.wrapMain = JSON.parse(result);

                        if (this.wrapMain.lstSearchNumberList.length == 0) {
                            this.strErrorMsg = 'No Phone Numbers found with ' + this.textValue;
                        } else {
                            this.isShowTable = true;
                        }
                        this.loaded = !this.loaded;
                    } else {
                        this.strErrorMsg = JSON.parse(result).strMsg;
                        this.loaded = !this.loaded;
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
        } else {
            this.strErrorMsg = 'Type something to search';
        }
    }

    handleClickCancel(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Purchased_Number__c',
                actionName: 'home',
            }
        });
    }
}