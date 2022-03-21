import { LightningElement, track } from 'lwc';

export default class TextAnythingAdminPanel extends LightningElement {
    
    @track showOptIn = false;

    handleShowOptInKeywords(event){
        this.showOptIn = event.detail.showoptIn;
    }
}