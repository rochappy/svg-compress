
const svgCompress = {
  $btnSelectFile: $('.btn-select-file'),
  $selectType: $('.select-type'),
  $inputSelectDir: $('.input-select-dir'),
  $btnSelectFileDir: $('.select-dir'),
  $inputOutputDir: $('.input-output'),
  $btnOutputFile: $('.btn-output-file'),
  $btnSelectDir: $('.btn-select-dir'),
  $btnSave: $('.btn-save'),
  $rowSelectFile: $('.select-file'),
  $rowSelectDir: $('.select-dir'),
  $inputSelectDir: $('.input-select-dir'),
  $btnViewFile: $('.btn-view-file'),
  curSelectType: 'dir',
  curDialogSelect: 'select_dir',
  outModalHtml: '',
  data: {
    type: 'dir',
    content: '',
    outputDir: [`${os.homedir()}/Downloads/svgCompress`]
  },
  init() {
    this.initIpc();
    this.initHtml();
    this.initEvent();
  },

  initHtml() {
    this.$inputOutputDir.val(this.data.outputDir);
  },
  initIpc() {
    ipcRenderer.on('selectedItem', (e, path) => {
      if (!path.length) {
        return;
      }

      if (this.curDialogSelect == 'select_dir') {
        this.$inputSelectDir.val(path);
        this.data.type = 'dir';
        this.data.content = path;
      } else if (this.curDialogSelect == 'select_file') {
        this.data.type = 'file';
        this.data.content = path;
      } else if (this.curDialogSelect == 'select_output') {
        this.$inputOutputDir.val(path);
        this.data.outputDir = path;
      }
    });
    ipcRenderer.on('outProcess', (e, data) => {
      $('#modal-output-process').modal();
      $('.out-process').append(`<div class="alert alert-primary">${data.file}</div>`);
      $('#modal-output-process .total').html(`共(${data.total})个`);
    });

    ipcRenderer.on('outDone', (e, data) => {
      if (!data.total) {
        $('.out-process').append(`<div class="alert alert-primary">无法找到 svg文件</div>`);
      }
    });
  },
  initEvent() {
    this.$selectType.on('change', () => {
      this.curSelectType = this.$selectType.val();

      if (this.curSelectType === 'file') {
        this.$rowSelectFile.show();
        this.$rowSelectDir.hide();
        this.data.type = 'file';
        this.data.content = [];
      } else {
        this.data.type = 'dir';
        this.data.content = [this.$inputSelectDir.val()];
        this.$rowSelectDir.show();
        this.$rowSelectFile.hide();
      }
    });

    this.$btnSelectFile.on('click', () => {
      this.curDialogSelect = 'select_file';
      ipcRenderer.send('open-dialog', {
        filters: [
          { name: 'Custom File Type', extensions: ['svg'] },
        ],
        properties: ['openFile', 'multiSelections']
      });
    });

    this.$btnSelectDir.on('click', () => {
      this.curDialogSelect = 'select_dir';
      ipcRenderer.send('open-dialog', {
        properties: ['openDirectory']
      });
    });

    this.$btnOutputFile.on('click', () => {
      this.curDialogSelect = 'select_output'
      ipcRenderer.send('open-dialog', {
        properties: ['openDirectory']
      });
    });

    this.$btnViewFile.on('click', () => {
      $('#modal-view-files').modal();
      if (this.data.content.length) {
        $('#modal-view-files').find('.modal-body').html('');
        this.data.content.forEach((item) => {
          $('#modal-view-files').find('.modal-body').append(`<div class="alert alert-primary list">${item}</div>`);
        });
      } else {
        $('#modal-view-files').find('.modal-body').html(`<div class="alert alert-primary list">暂无数据</div>`);
      }
    });
    this.$btnSave.on('click', () => {

      if (!this.data.content.length) {
        $('#modal-output').modal();
        return;
      }
      ipcRenderer.send('outsvg', this.data);
    });

    $('#modal-output-process').on('hide.bs.modal', ()=> {
      this.outModalHtml = '';
      $('.out-process').html('');
    });
  }
};

svgCompress.init();
