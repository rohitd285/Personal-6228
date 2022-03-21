({
    handleSelect : function (component, event, helper) {
        var stepName = event.getParam("detail").value;
        var toastEvent = $A.get("e.force:showToast");
        alert(document.getElementsByName(stepName));
        var elements = document.getElementsByName(stepName);
        if(elements=="Failed") 
        {
            alert('1');
             $A.util.removeClass(component.find("path"), 'slds-is-current slds-is-active');
           $A.util.addClass(component.find("path"), 'slds-is-complete');
        }
        toastEvent.setParams({
            "title": "Success!",
            "message": "Toast from " + stepName
        });
        toastEvent.fire();
    }
})