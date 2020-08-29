import { LightningElement } from 'lwc';

export default class UserRegistrationForm extends LightningElement {
    get departments() {
        return [
            { label: 'Human Resource', value: 'Human Resource' },
            { label: 'Data Processing', value: 'Data Processing' },
            { label: 'Admin', value: 'Admin' },
        ];
    }
}