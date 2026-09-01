# Convite de casamento — Tarcísio & Ellen

Convite interativo, mobile-first, feito em HTML, CSS e JavaScript puro.

O conteúdo funciona como um livro de sete folhas. No celular, o convidado pode arrastar para os
lados, tocar nas bordas ou usar as setas inferiores. As fotos são exibidas em molduras que seguem
a proporção original, sem cortes e sem preenchimentos artificiais nas laterais.

## Visualizar

Abra `index.html` diretamente ou sirva a pasta com qualquer servidor estático.

## Configurar a música

Por direitos autorais, nenhuma gravação comercial foi adicionada ao projeto. Coloque o arquivo
licenciado escolhido em:

`assets/audio/adele-romantic.mp3`

A faixa será iniciada após o visitante tocar no selo, que é o primeiro momento em que navegadores
móveis permitem reprodução com som.

Enquanto esse arquivo não existir, o botão de música abre uma playlist pública de casamento da
Adele no player oficial do Spotify. O Spotify exige que o próprio visitante toque em reproduzir.

## Conteúdo provisório

O local, horário, dress code e links de confirmação/presentes são demonstrativos. Eles estão
centralizados em `index.html` e `script.js` para facilitar a substituição.

## Imagens

As fotos atuais do casal estão em `assets/images/tarcisio-ellen-01.jpg` até
`assets/images/tarcisio-ellen-05.jpg`, já otimizadas para carregamento no convite.

Ao publicar o convite em um domínio definitivo, troque `og:image`/`twitter:image` em `index.html`
para uma URL absoluta (ex.: `https://seudominio.com/assets/images/tarcisio-ellen-01.jpg`) e adicione uma
tag `og:url` com o endereço final — isso garante que o link mostre uma prévia correta ao ser
compartilhado no WhatsApp.
