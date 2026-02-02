const IframeModal = {
  open({ url, title="", autoCloseOnUnload=true, onMessage=null, setHeader=false, width='80%', height='80%'}) 
  {
    const modal = document.createElement('div');

    modal.style.cssText = `
      position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:9999;
    `;

    const modalHeader = document.createElement('div');
    modalHeader.style.cssText = `
      display:flex; flex-shrink:0; align-items:center; justify-content:space-between; width:${width}; padding:1rem; background:white; border-bottom: 1px solid #dee2e6; border-radius: 8px 8px 0 0;
    `;
    modalHeader.innerHTML = `
      <h5 style="margin:0; font-weight:bold;">${title}</h5>
      <button style="box-sizing:content-box; width:1em; height:1em; border:0; background:transparent; font-weight:bold; font-size:1rem;" onclick="IframeModal.close()">X</button>
    `;

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.cssText = `
      width:${width}; height:${height}; border:none; background:white; border-radius: 0 0 8px 8px;
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) IframeModal.close();
    });

    window.addEventListener('message', (e) => {
      if (e.origin === window.location.origin && typeof onMessage === 'function') {
        onMessage(e.data, iframe.contentWindow);
      }
    });

    let reSize=()=>
    {
      if(window.innerWidth < 750)
      {
        iframe.style.width="100%";
        modalHeader.style.width="100%";
      }
      else
      {
        iframe.style.width=width;
        modalHeader.style.width=width;
      }
      
      if(!iframe.contentWindow || !iframe.contentWindow.document || !iframe.contentWindow.document.body)return;

      if(iframe.contentWindow.document.body.clientHeight > 500 || height=="auto")
      {
        iframe.style.height=iframe.contentWindow.document.body.clientHeight+"px";
      }
      else
      {
        iframe.style.height=height;
      }
    }
    window.addEventListener("resize", function(event) 
    {
        reSize();
    }, true);

    if (autoCloseOnUnload) 
    {
      iframe.addEventListener('load', (e) => {
        try {
          if (title == "") {
            title = iframe.contentDocument?.title ?? "";
            const modalTitle = modalHeader.querySelector('h5');
            modalTitle.textContent = title;
          }

          iframe.contentWindow.addEventListener('unload', () => 
          {
            if(IframeModal._modal)IframeModal.close();
          });
        } catch (err) {
          // Algunos navegadores pueden restringir esto, especialmente si el iframe navega fuera del dominio
        }
      });
    }

    if (setHeader) modal.appendChild(modalHeader);
    modal.appendChild(iframe);
    document.body.appendChild(modal);
    IframeModal._modal = modal;
    IframeModal._iframe = iframe;
    
    iframe.addEventListener('load', (e) => 
    {
      reSize();
    });
    
    // setTimeout(() => 
    // {
    //   reSize();
    // }, 300);
  },

  send(message) {
    if (IframeModal._iframe) {
      IframeModal._iframe.contentWindow.postMessage(message, window.location.origin);
    }
  },

  close() 
  {
    try 
    {
      document.body.removeChild(IframeModal._modal);
      IframeModal._iframe = null;
      IframeModal._modal = null;
    } catch (error) { }
  }
};



/** 
 * Ejemplos

IframeModal.open({
  url: '/modulo.html',
  autoCloseOnUnload: true,
  onMessage: (data) => {
    console.log('Mensaje desde iframe:', data);
  }
});

IframeModal.open({
  url: '/modulo.html',
  onMessage: (data, iframeWindow) => {
    console.log('Mensaje desde iframe:', data);
    if (data === 'solicitarDatos') {
      IframeModal.send({ tipo: 'respuesta', datos: { nombre: 'Emmanuel' } });
    }
  }
});

// Enviar mensaje al padre
window.parent.postMessage('solicitarDatos', window.location.origin);

// Recibir respuesta
window.addEventListener('message', (e) => {
  if (e.origin === window.location.origin && e.data.tipo === 'respuesta') {
    console.log('Datos recibidos del padre:', e.data.datos);
  }
});
*/