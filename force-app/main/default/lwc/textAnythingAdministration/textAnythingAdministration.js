import { LightningElement, track } from 'lwc';
import getSetupWiz from '@salesforce/apex/TextAnythingSetupWizard.getSetupWiz';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import CUSTOM_CSS from '@salesforce/resourceUrl/custom_style';

export default class TextAnythingAdministration extends LightningElement {
    
    @track isSetupCompleted;
	@track isPageReady = false;
    @track error;
    @track objWarp = {isSuccess : '', strMessage : '', objTAS : '' };
    
    showToast(title, msg, typeOfToast) {
        const eve = new ShowToastEvent({
            title: title,
            message: msg,
            variant: typeOfToast,
        });
        
        this.dispatchEvent(eve);
    }

    handleCloseWizard(){
        this.isSetupCompleted = true; 
    }

    connectedCallback(){
		getSetupWiz()
		.then(result => {
			if(JSON.parse(result).isSuccess){
				this.isPageReady = true;
				this.objWarp.isSuccess = JSON.parse(result).isSuccess;
				this.objWarp.strMessage = JSON.parse(result).strMessage;
				this.objWarp.objTAS = JSON.parse(result).objTAS;
				if(this.objWarp.objTAS != null){
					this.isSetupCompleted = this.objWarp.objTAS.Setup_Completed__c;
				}
			}
			else{
				this.isPageReady = true;
				this.error = JSON.parse(result).strMessage;
				this.showToast('Error', this.error, 'error');
			}
		})
		.catch(error => {
			this.error = 'Unknown error';
			this.isPageReady = true;
			if (Array.isArray(error.body)) {
				this.error = error.body.map(e => e.message);
			}
			// UI API DML, Apex and network errors
			else if (error.body && typeof error.body.message === 'string') {
				this.error =  error.body.message;
			}
			// JS errors
			else if (typeof error.message === 'string') {
				this.error =  error.message;
			}
			this.showToast('Error', this.error, 'error');
		});
		
		loadStyle(this, CUSTOM_CSS)
        .then(() => {});
    }
}