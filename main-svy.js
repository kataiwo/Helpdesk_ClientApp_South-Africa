import { CLOSE_ICON, MESSAGE_ICON, styles } from "./assets.js";

const GROUP_NAME = "South-Africa MILERT Helpdesk"                          //TODO: modify as appropriate
const GROUP_ID = "3"                                                       //TODO: modify as appropriate
const PROGRAM_BASE = "south-africa"                                        //TODO: modify as appropriate
const API_URL = `https://apis.livingseed.net/${PROGRAM_BASE}/tickets`

const surveyJson = {
  pages: [
      {
        name: "Personal",
        title: "Personal Information",        
        elements: [
          {
            name: "personal-information",            
            type: "panel",
            // state: "expanded",
            elements: [
              {
                name: "name",
                title: "Name:",
                titleLocation: "left",
                placeholder: "Enter your full name here",
                type: "text",
                isRequired: true,
                requiredErrorText: "Your name is required"
              }, 
              {
                  name: "email",
                  title: "Email:",
                  titleLocation: "left",
                  placeholder: "Enter your email here",
                  type: "text",
                  isRequired: true,
                  requiredErrorText: "Your email is required",
                  validators: [
                    { "type": "email", "text": "Value must be a valid email" }
                  ]
              }, 
              // {
              //   name: "telNo",
              //   title: "WhatsApp No:",
              //   titleLocation: "left",
              //   placeholder: "WhatsApp No with country code",
              //   type: "text",
              //   isRequired: false,
              //   description: "Provide this only if you want us to contact you",
              //   descriptionLocation: "underInput"
              // }, 
            ]
          }, 
          {        
            name: "program",
            title: "Program:",
            titleLocation: "left",
            isRequired: true,
            type: "dropdown",
            showNoneItem: true,
            showOtherItem: false,
            choices: ["Nigeria MILERT", "South-Africa MILERT", "Ghana MILERT", "Liberia MILERT", "Canada MILERT", "Malawi MILERT",
                      "Languages MILERT", "FRASED Abidjan", "FRASED Benin"],
            defaultValue: "South-Africa MILERT",
            readOnly: true,
          },
        ]
      },
      { 
        name: "Issues",
        title: "Issues Encountered",
        description: "Describe the challenge you are having.",
        elements: [
          {
            name: "issues-encountered",
            type: "panel",
            elements: [
              {
                name: "subject",
                title: "Subject",
                // titleLocation: "left",
                placeholder: "Enter subject of your issue",
                type: "text",
                isRequired: true,
                requiredErrorText: "Value cannot be empty"
              }, 
              {
                name: "message",
                title: "Message",
                type: "comment",    
                isRequired: true,
                placeholder: "Enter a brief description of your issue here ...",
                maxLength: 600,
                allowResize: false
              }, 
            ]
          },
          { 
            name: "file-upload",            
            type: "panel",
            title: "Upload file (if necessary)",
            description: "If necessary, click here to upload (max 500kb)...",
            state: "collapsed",
            elements: [
              {
                "type": "file",
                "title": "Upload your file",
                "name": "files",
                "storeDataAsText": true,
                "waitForUpload": true,
                "allowMultiple": false,
                "maxSize": 512000, //=500kb, 1048576, //=1mb 102400, //=100kb
                "hideNumber": true,
                'acceptedTypes': ".doc,.docx,.pdf,image/*"
              }
            ]
          }
        ]
      }
    ],
    showQuestionNumbers: false,
    fitToContainer: true,
    completedHtml: "Thank you, please be checking your email for our response.<br />God bless you.",
    completeText: "Send"
};

class MessageWidget {
  constructor(position = "bottom-left") {
    this.position = this.getPosition(position);
    this.open = false;
    this.initialize();
    this.injectStyles();
  }

  position = "";
  open = false;
  widgetContainer = null;

  getPosition(position) {
    const [vertical, horizontal] = position.split("-");
    return {
      [vertical]: "30px",
      [horizontal]: "30px",
    };
  }  

  async initialize() {
    /**
     * Create and append a div element to the document body
     */
    const container = document.createElement("div");
    container.style.position = "fixed";
    Object.keys(this.position).forEach(
      (key) => (container.style[key] = this.position[key])
    );
    document.body.appendChild(container);

    /**
     * Create a button element and give it a class of button__container
     */
    const buttonContainer = document.createElement("button");
    buttonContainer.classList.add("button__container");

    /**
     * Create a span element for the widget icon, give it a class of `widget__icon`, and update its innerHTML property to an icon that would serve as the widget icon.
     */
    const widgetIconElement = document.createElement("span");
    widgetIconElement.innerHTML = MESSAGE_ICON;
    widgetIconElement.classList.add("widget__icon");
    this.widgetIcon = widgetIconElement;

    /**
     * Create a span element for the close icon, give it a class of `widget__icon` and `widget__hidden` which would be removed whenever the widget is closed, and update its innerHTML property to an icon that would serve as the widget icon during that state.
     */
    const closeIconElement = document.createElement("span");
    closeIconElement.innerHTML = CLOSE_ICON;
    closeIconElement.classList.add("widget__icon", "widget__hidden");
    this.closeIcon = closeIconElement;

    /**
     * Append both icons created to the button element and add a `click` event listener on the button to toggle the widget open and close.
     */
    buttonContainer.appendChild(this.widgetIcon);
    buttonContainer.appendChild(this.closeIcon);
    buttonContainer.addEventListener("click", this.toggleOpen.bind(this));

    /**
     * Create a container for the widget and add the following classes:- `widget__hidden`, `widget__container`
     */
    this.widgetContainer = document.createElement("div");
    this.widgetContainer.classList.add("widget__hidden", "widget__container");

    /**
     * Invoke the `createWidget()` method
     */
    this.createWidgetContent();

    /**
     * Append the widget's content and the button to the container
     */
    container.appendChild(this.widgetContainer);
    container.appendChild(buttonContainer);
  }

  createWidgetContent() {
    this.widgetContainer.innerHTML = `
      <header class="widget__header">
        <h3>Contact MILERT Helpdesk</h3>
        <p>Reply will be sent to your email</p>
      </header>
      <div id="surveyContainer"></div>
    `;

    //attachment
    let hasAttachment = false
    //add survey
    const survey = new Survey.Model(surveyJson);

    $(function() {
        $("#surveyContainer").Survey({ model: survey });
    });

    function saveSurveyResults(outputJson) {
      //save
      fetch(API_URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(outputJson),
      })
      .then(response => console.log(`${response.status} - ${response.statusText}`))
      .catch(error => {
        alert('Error on sending message to helpdesk!')
        console.log(error)
      })
    }

    function surveyComplete (sender) {
      var newData = sender.data
      //parse attachments
      let fileName = ''
          ,fileType = ''
          ,fileData = ''

      if (sender.data.hasOwnProperty('files')) {
        fileName = sender.data.files[0].name
        fileType = sender.data.files[0].type
        fileData = sender.data.files[0].content.split('base64,').pop()
        hasAttachment = true        
      }

      //then delete files property        
      if (hasAttachment) delete newData['files']     

      //build output
      const attachment = [{
        'filename'  : fileName,
        'data'      : fileData,
        'mime-type' : fileType,
      }]

      const data = {
        'title'       : newData.program + ": " + newData.subject,  
        'group_id'    : GROUP_ID,
        'group'       : GROUP_NAME,  
        'customer_id' : "guess:"  + newData.email,  
        'tags'        : "online", 
        'article'     : {
                          'subject'       : newData.subject,
                          'reply_to'      : newData.email,
                          'from'          : newData.name + " <" + newData.email + ">",
                          'to'            : GROUP_NAME,
                          'body'          : newData.message,
                          'type'          : "email",
                          'sender'        : "Customer",
                          'internal'      : false,
                          'content_type'  : "text/html",
                        }
      }

      //output
      let output
      if (hasAttachment) output = { ...data, article: { ...data.article, attachments: attachment }}
      else output = { ...data }
                     
      //save
      saveSurveyResults(output)
    }

    //on complete
    survey.onComplete.add(surveyComplete);
  }

  injectStyles() {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = styles.replace(/^\s+|\n/gm, "");
    document.head.appendChild(styleTag);
  }

  toggleOpen() {
    this.open = !this.open;
    if (this.open) {
      this.widgetIcon.classList.add("widget__hidden");
      this.closeIcon.classList.remove("widget__hidden");
      this.widgetContainer.classList.remove("widget__hidden");
    } else {
      this.createWidgetContent();
      this.widgetIcon.classList.remove("widget__hidden");
      this.closeIcon.classList.add("widget__hidden");
      this.widgetContainer.classList.add("widget__hidden");
    }
  }
}

function initializeWidget() {
  return new MessageWidget();
}

initializeWidget();

