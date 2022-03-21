import { LightningElement, track } from 'lwc';
import initTextManagerConfig from "@salesforce/apex/TextManagerConfigController.initTextManagerConfig";
import saveTextManagerConfig from "@salesforce/apex/TextManagerConfigController.saveTextManagerConfig";

export default class TextAnythingTextManagerConfig extends LightningElement {

	@track wrapMain = new Object();
	@track OrganizeMessage = "";
	@track daysOld = 0;
	@track showAllTimeMessage = true;
	@track loaded = false;
	@track strErrorMsg = '';
	@track strSuccess = '';
	@track lstOptions = [
		{
			label: 'By Phone Number',
			value: 'Phone'
		},
		{
			label: 'By Record',
			value: 'Record'
		}
	];

	connectedCallback() {
		initTextManagerConfig()
			.then(result => {
				if (JSON.parse(result).isSuccess) {
					this.wrapMain = JSON.parse(result);
					if (this.wrapMain.custTextAnything != null && this.wrapMain.custTextAnything != undefined) {
						if (this.wrapMain.custTextAnything.Text_Manager_Grouping__c != null && this.wrapMain.custTextAnything.Text_Manager_Grouping__c != undefined && this.wrapMain.custTextAnything.Text_Manager_Grouping__c != '') {
							this.OrganizeMessage = this.wrapMain.custTextAnything.Text_Manager_Grouping__c;
						}

						if (this.wrapMain.custTextAnything.Day_s_Old_Message__c != null && this.wrapMain.custTextAnything.Day_s_Old_Message__c != undefined && this.wrapMain.custTextAnything.Day_s_Old_Message__c != '') {
							this.daysOld = this.wrapMain.custTextAnything.Day_s_Old_Message__c;
						}

						this.showAllTimeMessage = this.wrapMain.custTextAnything.Show_Message_All_Time__c;
					}

					this.loaded = !this.loaded;
				} else {
					this.loaded = !this.loaded;
					this.strErrorMsg = JSON.parse(result).strMsg;
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

	}

	changerad(event) {
		this.OrganizeMessage = event.target.value;
	}

	changeShowMessageAllTime(event) {
		this.showAllTimeMessage = event.target.checked;
	}

	changeOldDays(event) {
		this.daysOld = event.target.value;
	}

	onSaveEve(event) {
		this.onClearMessage();
		this.loaded = !this.loaded;

		if (this.daysOld != null && this.daysOld < 10 && this.showAllTimeMessage != true) {
			this.loaded = !this.loaded;
			this.strErrorMsg = 'Days can not be less than 10.';
		}
		else {
			saveTextManagerConfig({ wrapperString: JSON.stringify(this.wrapMain), groupByMessage: this.OrganizeMessage, daysOld: this.daysOld, showAllTimeMessage: this.showAllTimeMessage })
				.then(result => {
					if (JSON.parse(result).isSuccess) {
						this.wrapMain = JSON.parse(result);
						if (this.wrapMain.custTextAnything != null && this.wrapMain.custTextAnything != undefined) {
							this.OrganizeMessage = this.wrapMain.custTextAnything.Text_Manager_Grouping__c;
							this.daysOld = this.wrapMain.custTextAnything.Day_s_Old_Message__c;
						}
						this.loaded = !this.loaded;
						this.strSuccess = 'Record Saved Successfully';
						this.hideSuccessMessage();
					} else {
						this.loaded = !this.loaded;
						this.strErrorMsg = JSON.parse(result).strMsg;
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