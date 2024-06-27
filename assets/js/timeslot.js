// Timeslot Class
class Timeslot {
    //constructor(hours, element) {
    constructor(parentClient, hours = 0, workdayIndex=-1, startIndex = 0, controllerElement = null){
        this.parentClient = parentClient;
        // this.element = element;
        this.element = document.createElement('div');
        this.element.className = 'timeslot';
        this.element.id = generateUniqueId('timeslot');
        this.element.style.display = 'none';

        //if(controllerElement != null)  this.setController(controllerElement);

        this.controllerElement = controllerElement;
        this.controllerElement.setAttribute('linked-timeslot',this.element.id);
        this.parentRow = this.controllerElement.closest('tr');

        this.setHours(hours);
        this.setStartIndex(startIndex);
        this.setWorkdayIndex(workdayIndex);

        // add this timeslot to the global list
        allTimeslots[this.element.id] = this;

        this.setupTimeslot();
    }

    setupTimeslot(){
        // Add timeslot hours input
        this.timeslotInput = document.createElement('input');
        this.timeslotInput.value = this.getHours();
        this.timeslotInput.type = 'number';
        this.timeslotInput.min = '0';
        this.timeslotInput.max = hoursPerDay;
        this.timeslotInput.onchange = ()=>{ this.setHours(this.timeslotInput.value); };
        this.controllerElement.appendChild(this.timeslotInput);

        // Add timeslot insert button
        this.insertTimeslotButton = document.createElement('button');
        this.insertTimeslotButton.innerText = '✓';
        this.insertTimeslotButton.className = 'insert-timeslot';
        this.insertTimeslotButton.onclick = insertNewTimeslotFunction;
        this.controllerElement.appendChild(this.insertTimeslotButton);

        // Add timeslot removal button
        this.removeTimeslotButton = document.createElement('button');
        this.removeTimeslotButton.innerText = '✕';
        this.removeTimeslotButton.className = 'remove-timeslot';
        this.removeTimeslotButton.onclick = removetimeslotControllerFunction;
        this.controllerElement.appendChild(this.removeTimeslotButton);
    }

    insertTimeslot(){
        this.insertTimeslotButton.click();
    }

    getHours(){
        let hours = this.controllerElement.getAttribute('data-hours'); 
        return parseInt(hours);
    }

    setHours(hours){ 
        hours = parseInt(hours);
        this.controllerElement.setAttribute('data-hours', hours);
        // update the input value
        if(this.timeslotInput) this.timeslotInput.value=hours;
        this.element.style.width = hours * timeslotHourWidth + 'px';
    }

    getStartIndex(){ 
        let startIndex = this.controllerElement.getAttribute('data-start-index'); 
        return parseInt(startIndex);
    }

    setStartIndex(startIndex){
        startIndex = Math.max(0,startIndex);
        this.setHours(Math.min(this.getHours() + startIndex, hoursPerDay) - startIndex);
        startIndex = parseInt(startIndex);
        this.controllerElement.setAttribute('data-start-index', startIndex); 
        this.element.style.left = startIndex * timeslotHourWidth + firstTimeslotLeftPadding + 'px';
    }
    
    getWorkdayIndex(){ return this.controllerElement.getAttribute('data-workday-index');  }
    setWorkdayIndex(workdayIndex){ 
        workdayIndex = parseInt(workdayIndex);
        this.controllerElement.setAttribute('data-workday-index', workdayIndex); 
        this.parentRow.querySelectorAll('td')[2 + workdayIndex].appendChild(this.element);
    }


    removeMe(){
        this.controllerElement.remove();
        this.element.remove();
        this.parentClient.timeslots.splice(this.parentClient.timeslots.indexOf(this),1);

        // remove this timeslot to the global list
        allTimeslots.splice(allTimeslots.indexOf(this),1);
    }

    refresh(){

    }

    updateVerticalPosition(){
        var verticalTimeslotPos = this.controllerElement.getBoundingClientRect().y - this.controllerElement.closest('td').getBoundingClientRect().y;
        this.element.style.top = Math.floor(verticalTimeslotPos) - 1 + 'px'; // -2
        console.log("verticalTimeslotPos:"+verticalTimeslotPos);
    }

    isOngoing(){
        if(this.getWorkdayIndex() == -1) return false;
        let beginDate = new Date(workdays[this.getWorkdayIndex()].date);

        let beginTime = beginDate.setHours(beginDate.getHours() + (8 + this.getStartIndex()));
        let endTime = beginDate.setHours(beginDate.getHours() + this.getHours());
            
        let currentDate = new Date();
        return (beginTime < currentDate && currentDate < endTime);
    }
    

}