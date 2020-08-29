import { LightningElement, track, wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountDataService.getAccounts';
import { NavigationMixin } from 'lightning/navigation'
export default class AccountSearchForm extends NavigationMixin(LightningElement) {
    @track selectedAccountId = '';
    
    // Private
    @track error = undefined;
    
    @track searchAccount;
    
    // Wire a custom Apex method
    @wire (getAccounts)  Accounts({ error, data }) {
      if (data) {
        this.searchAccount = data.map(account => {
           return {
            label: account.Name,
            value: account.Id
            };
        });
        this.searchAccount.unshift({ label: 'All Accounts', value: '' });
      } else if (error) {
        this.searchOptions = undefined;
        this.error = error;
      }
    }

    createNewAccount() { 
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Account',
                actionName: 'new'
            }
        });
    }
}