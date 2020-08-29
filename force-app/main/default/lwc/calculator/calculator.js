import { LightningElement, track } from 'lwc';
const new1 = 'new';
export default class Calculator extends LightningElement {
    firstnumber;
    secondnumber;
    result;
    @track showPreviousResult=false;
    addLabel = 'Add';
    subtractLabel = 'Subtract';
    multiplyLabel = 'Multiply';
    divideLabel = 'Divide';
    @track previousResult= [];
    captureShowResult(event)
    {
        //this.showPreviousResult = event.detail.value;
        this.showPreviousResult = event.target.checked;
    }
    captureInput1(event)
    {
        this.firstnumber = event.detail.value;
        console.log(event.target.name);
        
    }
    captureInput2(event)
    {
        this.secondnumber = event.detail.value;
        console.log(event.target.label);
    }

    onCompute(event)
    {
        this.result = (event.target.label=== 'Add')? ( parseInt(this.firstnumber) + parseInt(this.secondnumber) ):
        (event.target.label==='Subtract')? (this.firstnumber - this.secondnumber) :
        (event.target.label==='Multiply')?  (this.firstnumber * this.secondnumber) :
        (event.target.label==='Divide')? (this.firstnumber / this.secondnumber) : 0;
        const newResult = {
            num1 : this.firstnumber,
            num2 : this.secondnumber,
            operator : event.target.label,
            num3 : this.result
        }
        this.previousResult.push(newResult);
    }
    
}