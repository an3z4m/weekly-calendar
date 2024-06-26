// Timeslot Class
class Timeslot {
    //constructor(hours, element) {
    constructor(hours = 0, workdayIndex=-1, startIndex = 0, controllerElement = null){
        this.hours = hours;
        // this.element = element;
        this.workdayIndex = workdayIndex;
        this.element = document.createElement('div');
        this.element.className = 'timeslot';
        this.element.id = generateUniqueId('timeslot');
        this.startIndex = startIndex;
        if(controllerElement != null)  this.setController(controllerElement);
    }
    
    setController(controllerElement){
        this.controllerElement = controllerElement;
        this.controllerElement.setAttribute('data-hours', this.hours);
        this.controllerElement.setAttribute('data-workday-index', this.workdayIndex);
        this.controllerElement.setAttribute('data-start-index', this.startIndex);
        this.parentRow = null;
    }

    updateVerticalPosition(){
        var verticalTimeslotPos = this.controllerElement.getBoundingClientRect().y - this.controllerElement.closest('td').getBoundingClientRect().y;
        this.element.style.top = Math.floor(verticalTimeslotPos) - 2 + 'px';
        console.log("verticalTimeslotPos:"+verticalTimeslotPos);
    }
    isOngoing(){
        if(this.workdayIndex == -1) return false;
        let beginDate = new Date(workdays[this.workdayIndex].date);

        let beginTime = beginDate.setHours(beginDate.getHours() + (8 + this.startIndex))
        let endTime = beginDate.setHours(beginDate.getHours() + (8 + this.startIndex + this.hours))
            
        let currentDate = new Date();
        return (beginTime < currentDate && currentDate < endTime);
    }

}