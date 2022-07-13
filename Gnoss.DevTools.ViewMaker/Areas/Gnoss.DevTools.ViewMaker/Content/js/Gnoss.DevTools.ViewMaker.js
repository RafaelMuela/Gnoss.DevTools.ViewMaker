﻿$(document).ready(function () {

    $(':checkbox').checkboxpicker();

    $('.form-group.botones input').click(function () {
        body.addClass("palco");
        body.removeClass("showBasicAuth");
        $('#authBasic').hide();

        $('iframe', body).remove();

        var url = encodeURIComponent($('input#URL').val());
        var sessionID = $('input#SessionID').val();
        var user = $('input#User').val();
        var pass = $('input#Password').val();
        var contentLocal = $('input#contentLocal').is(':checked');
        var submit = $(this).val();
        
        var urlIframe = location.protocol + '//' + location.host + '/LoadURL';
        var srcIframe = urlIframe + "?URL=" + url + "&SessionID=" + sessionID + "&User=" + user + "&Password=" + pass + "&contentLocal=" + contentLocal + "&submit=" + submit

        body.append("<iframe id='iframeContenedor' src='" + srcIframe + "' />");
        
        setTimeout(function () { engancharEvento(); }, 1000);
    });


    $('body.configuracion .form-group label span.fa.fa-trash:not(".disabled")').click(function () {
        $(this).closest('.form-group').remove();
    });

    $('body a.dropdown-toggle.authBasic').click(function () {
        event.preventDefault();
        $('body').toggleClass('showBasicAuth');
        $('#authBasic').toggle();
    });

    $('#confirmationModal .modal-footer').on('click', '.btn-primary.changeBranch', function () {
        var boton = $(this);
        var modal = boton.closest('.modal');
        var modalBody = modal.find('.modal-body');
        var proyecto = boton.attr("proyecto");

        boton.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Descargando...');
        modal.find('.modal-footer .btn-secondary').hide();

        $.post("/Configuration/ChangeBranch", { proyectName: proyecto })
            .done(function (status) {
                if (status) {
                    modalBody.append('<div class="alert alert-success" role="alert">Descarga correcta</div>');
                }
                else {
                    modalBody.append('<div class="alert alert-danger" role="alert">Descarga fallida</div>');
                }
                modal.find('.modal-footer').hide();
            });
    });

    $('#confirmationModal .modal-footer').on('click', '.btn-primary.download', function () {
        var boton = $(this);
        var modal = boton.closest('.modal');
        var modalBody = modal.find('.modal-body');
        var proyecto = boton.attr("proyecto");

        boton.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Descargando...');
        modal.find('.modal-footer .btn-secondary').hide();


        $.post("/Configuration/DownloadProject", { proyectName: proyecto })
            .done(function (status) {
                if (status) {
                    modalBody.append('<div class="alert alert-success" role="alert">Descarga correcta</div>');
                    $('.fa-cloud-upload[data-proyecto="' + proyecto + '"]').removeClass("disabled");
                    $('.fa-cloud-download[data-proyecto="' + proyecto + '"]').addClass("no-changes");
                }
                else {
                    modalBody.append('<div class="alert alert-danger" role="alert">Descarga fallida</div>');
                }
                modal.find('.modal-footer').hide();
            });
    });


    $('#confirmationModal .modal-footer').on('click', '.btn-primary.upload', function () {
        var boton = $(this);
        var modal = boton.closest('.modal');
        var modalBody = modal.find('.modal-body');
        var proyecto = boton.attr("proyecto");

        var userFTP = modalBody.find("#userFTP").val();
        var passwordFTP = modalBody.find("#passwordFTP").val();

        boton.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Subiendo...');
        modal.find('.modal-footer .btn-secondary').hide();

        $.post("/Configuration/UploadProject", { proyectName: proyecto, userFTP: userFTP, passwordFTP: passwordFTP })
          .done(function (status) {
              if (status) {
                  modalBody.append('<div class="alert alert-success" role="alert">Subida OK</div>');
              }
              else {
                  modalBody.append('<div class="alert alert-danger" role="alert">Subida KO</div>');
              }
              modal.find('.modal-footer').hide();
          });

    });

    var tituloModal = {
        upload: 'Confirmar subida de vistas y estilos de ',
        download: 'Confirmar descarga de vistas y estilos de ',
        changeBranch: 'Confirmar cambio de rama de '
    };

    $('#confirmationModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        if (button.hasClass('disabled') || button.hasClass('no-changes')) {
                $('#confirmationModal').modal('hide');
                return false;
        }
        var parentButton = button.closest('.form-group');

        var proyecto = parentButton.attr('data-proy');

        var titleAction = button.attr("title");
        var btnClass = button.attr("class");
        var typeAction = button.data('action');

        var modal = $(this);
        modal.find('.modal-body .alert').remove();
        modal.find('.modal-body').children().hide();
        modal.find('.modal-body .' + typeAction).show();

        var panCambiosRepositorioLocal = modal.find('.modal-body .panCambios');
        panCambiosRepositorioLocal.find('.cambios').html('');
        panCambiosRepositorioLocal.hide();

        if (typeAction == 'upload') {
            var userFTP = parentButton.find(".userFTP").val();
            var passwordFTP = parentButton.find(".passwordFTP").val();

            $("#userFTP").val(userFTP);
            $("#passwordFTP").val(passwordFTP);

            var cambios = parentButton.find(".cambios").val();
            if (cambios != "") {
                panCambiosRepositorioLocal.find('.cambios').html(cambios);
                panCambiosRepositorioLocal.show();
            }
        }

        modal.find('.modal-title').text(tituloModal[typeAction] + ' \'' + proyecto + '\'');

        modal.find('.modal-footer').show();
        modal.find('.modal-footer .btn-secondary').show();
        modal.find('.modal-footer .btn-primary').attr('class', 'btn btn-primary ' + typeAction).attr('proyecto', proyecto).html("<span class='" + btnClass + "'></span>" + titleAction);
    })


    $("#configurationForm").submit(function (e) {
        e.preventDefault();
        var form = $(this);
        var btnSubmit = $('button[type=submit]', form);
        btnSubmit.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>  Guardando...');

        var actionUrl = $(this).attr("action");
        $.post(actionUrl, $(this).serialize(), function (status) {
            $('.alert', form).remove();
            if (status) {
                form.append('<div class="alert alert-success" role="alert">Configuración guardada correctamente</div>');
            }
            else {
                form.append('<div class="alert alert-danger" role="alert">Ha habido errores al guardar la configuración, intentalo otra vez</div>');
            }
            btnSubmit.html('Guardar');
        });
    });

    $('body.configuracion .form-group').on('click', 'span.fa.fa-cloud-upload.disabled', function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });
     
    toggleVerPassword.init();
});

var toggleVerPassword = {
    init: function () {
        this.config();
        this.verPassword();
        return;
    },
    config: function () {
        this.body = body;
        this.inputsPassword = this.body.find('input[type=password]');
        this.inputsPassword.after('<a class="verPassword" href="javascript: void(0);"><span class="fa fa-eye-slash"></span></a>');
        return;
    },
    verPassword: function () {
        this.inputsPassword.next('a.verPassword').on('click', function () {
            var btnPass = $(this);
            var spanEye = $('span.fa', btnPass);
            var inputPass = btnPass.prev('input');

            if (inputPass.attr('type') === 'password') {
                inputPass.attr('type', 'text');
                spanEye.removeClass("fa-eye-slash");
                spanEye.addClass("fa-eye");
            } else {
                inputPass.attr('type', 'password');
                spanEye.removeClass("fa-eye");
                spanEye.addClass("fa-eye-slash");
            }
        });
        return;
    }
};

function engancharEvento() {
    var iframe = document.getElementById("iframeContenedor");

    iframe.contentDocument.onkeydown = fkey;
    iframe.contentDocument.onkeypress = fkey;
    iframe.contentDocument.onkeyup = fkey;

    recargando = false;
}

document.onkeydown = fkey;
document.onkeypress = fkey
document.onkeyup = fkey;

var recargando = false;
var body = $('body');

function fkey(e) {
    if (body.hasClass("palco")) {
        e = e || window.event;

        if (e.keyCode == 116) {
            if (!recargando) {
                recargando = true;
                $('#cargar').focus()
                $("#cargar").trigger("click");
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }
}

window.onbeforeunload = function (e) {
    if (body.hasClass("palco") && recargando) {
        var dialogText = '¿Seguro que quieres salir?';
        e.returnValue = dialogText;
        return dialogText;
    }
};