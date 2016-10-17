import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { TemplateController } from 'meteor/space:template-controller';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import resemble from 'resemblejs';

import './main.html';

TemplateController('fileComparer', {
  props: new SimpleSchema({
    publicComparitionUrl: { type: String },
  }),

  state: {
    blobFile: null,
    diffBlobFileUrl: null,
    dataMismatchPercentage: 0,
    diffing: false,
  },

  onCreated() {
    const xhr = new XMLHttpRequest(); xhr.open('GET', this.props.publicComparitionUrl, true);
    const inst = this;
    xhr.responseType = 'blob';
    xhr.onload = function(e) {
      inst.state.blobFile = this.response;
      console.log(this.response);
    };
    xhr.send();
  },

  helpers: {
    diffFiles() {
      return (file) => {
        this.state.diffing = true;
        resembleControl = resemble(file).compareTo(this.state.blobFile)
          .scaleToSameSize()
          .ignoreAntialiasing()
          .onComplete((resemblanceData) => {
            this.state.diffing = false;
            this.state.diffBlobFileUrl = resemblanceData.getImageDataUrl();
            this.state.dataMismatchPercentage = resemblanceData.misMatchPercentage;
          });
      };

    },
  },
})

TemplateController('fileUploader', {
  props: new SimpleSchema({
    onFileUpload: { type: Function },
  }),
  state: {
    fileUploadedUrl: '',
    red: '',
    green: '',
    blue: '',
    alpha: '',
    darkness: '',
  },
  events: {
    'change .file-input'(e) {
      const $target = this.$(e.target);
      const file = $target[0].files[0];
 
      const fileReader = new FileReader();

      fileReader.onload = (event) => {
        this.state.fileUploadedUrl =  event.target.result;
      };

      fileReader.readAsDataURL(file);

      console.log(file);

      resemble(file).onComplete((data) => {
        this.state.red = data.red;
        this.state.green = data.green;
        this.state.blue = data.blue;
        this.state.alpha = data.alpha;
        this.state.brightness = data.brightness;
      });

      this.props.onFileUpload(file);
    },
  },
});
