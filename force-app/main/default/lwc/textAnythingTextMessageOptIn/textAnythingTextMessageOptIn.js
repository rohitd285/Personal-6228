import { LightningElement, track, api } from 'lwc';
import getSetupWiz from '@salesforce/apex/TextAnythingSetupWizard.getSetupWiz';
import updateSetupWiz from '@salesforce/apex/TextAnythingSetupWizard.updateSetupWiz';

export default class TextAnythingTextMessageOptIn extends LightningElement {

	@track objWarp = { isSuccess: '', strMessage: '', objTAS: '' };
	@track isChecked = false;
	@track optInKeywords;
	@track error;
	@track lstOptInKeywords = [];
	@track isOptInKeywordsAdded = false;
	@track intOptInKeywordLength = 255;
	@track strErrorMsg = '';
	@track strSuccess = '';

	connectedCallback() {
		getSetupWiz()
			.then(result => {
				if (JSON.parse(result).isSuccess) {
					this.objWarp.isSuccess = JSON.parse(result).isSuccess;
					this.objWarp.strMessage = JSON.parse(result).strMessage;
					this.objWarp.objTAS = JSON.parse(result).objTAS;
					if (this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c != null && this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c.length > 0) {
						this.intOptInKeywordLength = 255 - this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c.length;
						this.lstOptInKeywords = this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c.split(",");
					}
					else {
						this.intOptInKeywordLength = 255;
					}
					this.isChecked = this.objWarp.objTAS.Is_One_To_One_Messaging__c;
				}
				else {
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
				}
			});
	}

	handleOptInToggle(event) {
		this.onClearMessage();
		const value = event.detail.checked;
		this.objWarp.objTAS.Is_One_To_One_Messaging__c = event.detail.checked;
		this.isChecked = this.objWarp.objTAS.Is_One_To_One_Messaging__c;

		if (value == false) {
			this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c = '';

			updateSetupWiz({ strLWCWarp: JSON.stringify(this.objWarp) })
				.then(result => {
					if (JSON.parse(result).isSuccess) {
						this.objWarp.isSuccess = JSON.parse(result).isSuccess;
						this.objWarp.strMessage = JSON.parse(result).strMessage;
						this.objWarp.objTAS = JSON.parse(result).objTAS;
						this.lstOptInKeywords = [];
						this.intOptInKeywordLength = 255;
						this.optInKeywords = '';
					}
					else {
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
					}
				});
		}
	}

	handleRemove(event) {
		this.onClearMessage();
		event.preventDefault();
		for (let i = 0; i < this.lstOptInKeywords.length; i++) {
			if (this.lstOptInKeywords[i] == event.target.label) {
				this.lstOptInKeywords.splice(i, 1);
			}
		}

		if (this.lstOptInKeywords.length > 0) {
			for (let j = 0; j < this.lstOptInKeywords.length; j++) {
				if (j == 0) {
					this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c = this.lstOptInKeywords[j];
				} else {
					this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c += ', ' + this.lstOptInKeywords[j];
				}
			}
		} else {
			this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c = '';
			this.intOptInKeywordLength = 255;
		}

		updateSetupWiz({ strLWCWarp: JSON.stringify(this.objWarp) })
			.then(result => {
				if (JSON.parse(result).isSuccess) {
					this.objWarp.isSuccess = JSON.parse(result).isSuccess;
					this.objWarp.strMessage = JSON.parse(result).strMessage;
					this.objWarp.objTAS = JSON.parse(result).objTAS;
					if (this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c != null && this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c.length > 0) {
						this.intOptInKeywordLength = 255 - this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c.length;
						this.lstOptInKeywords = this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c.split(",");
					} else {
						this.lstOptInKeywords = [];
						this.intOptInKeywordLength = 255;
					}
					this.optInKeywords = '';
					this.strSuccess = 'Keywords Deleted Successfully.';
					this.hideSuccessMessage();
				}
				else {
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
				}
			});

	}

	onChangeHandler(event) {
		this.optInKeywords = event.target.value;

		if (this.optInKeywords != null && this.optInKeywords != '') {
			this.isOptInKeywordsAdded = true;
		}
		else {
			this.isOptInKeywordsAdded = false;
		}
	}

	handleSaveOptInKeyword(event) {
		this.onClearMessage();
		if (this.lstOptInKeywords.length > 0) {
			for (let j = 0; j < this.lstOptInKeywords.length; j++) {
				if (j == 0) {
					this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c = this.lstOptInKeywords[j];
				} else {
					this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c += ', ' + this.lstOptInKeywords[j];
				}
			}
		} else {
			this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c = '';
		}

		if (this.optInKeywords != null && this.optInKeywords != '') {
			if (this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c != '') {
				this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c += ', ' + this.optInKeywords;
			} else {
				this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c = this.optInKeywords;
			}
			updateSetupWiz({ strLWCWarp: JSON.stringify(this.objWarp) })
				.then(result => {
					if (JSON.parse(result).isSuccess) {
						this.objWarp.isSuccess = JSON.parse(result).isSuccess;
						this.objWarp.strMessage = JSON.parse(result).strMessage;
						this.objWarp.objTAS = JSON.parse(result).objTAS;
						if (this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c != null && this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c.length > 0) {
							this.intOptInKeywordLength = 255 - this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c.length;
							this.lstOptInKeywords = this.objWarp.objTAS.Text_Message_Opt_In_Keywords__c.split(",");
						} else {
							this.intOptInKeywordLength = 255;
							this.lstOptInKeywords = [];
						}
						this.optInKeywords = '';
						this.isOptInKeywordsAdded = false;
						this.strSuccess = 'Keywords are inserted Successfully.';
						this.hideSuccessMessage();
					}
					else {
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
					}
				});
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