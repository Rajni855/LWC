import { LightningElement, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class UserRegistrationForm extends LightningElement {
    name;
    age;
    department;
    phone;
    email;
    userid;
    get departments() {
        return [
            { label: 'Human Resource', value: 'Human Resource' },
            { label: 'Data Processing', value: 'Data Processing' },
            { label: 'Admin', value: 'Admin' },
        ];
    }
    captureName(event)
    {
       this.name = event.target.value;     
    }
    captureAge(event)
    {
       this.age = event.target.value;     
    }
    capturePhone(event)
    {
       this.phone = event.target.value;     
    }
    captureEmail(event)
    {
       this.email = event.target.value;     
    }
    captureDepartment(event)
    {
       this.department = event.target.value;     
    }
    createUser(event)
    {
        const fields = {
            "Name" : this.name,
            "Email__c" : this.email,
            "Phone__c" : this.phone,
            "Department__c" : this.department,
            "Age__c" : this.age,
        }
        const recordInput = { apiName: "LWCUser__c", fields };
        createRecord(recordInput)
        .then(result => {
            this.userid = result.id;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'User created',
                    variant: 'success',
                }),
            );
            this.name = null;
           
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        });
    }
}