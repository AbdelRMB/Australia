document.addEventListener('DOMContentLoaded',()=>{
  
  // Navigation system
  function showPage(pageId){
    document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
    document.getElementById(pageId+'Page').classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
  }
  window.showPage = showPage; // Make it global for onclick handlers
  
  document.querySelectorAll('.nav-item').forEach(btn=>{
    btn.addEventListener('click',()=>{
      showPage(btn.dataset.page);
    });
  });

  // Dark mode management
  const darkModeKey = 'dark_mode';
  let isDarkMode = localStorage.getItem(darkModeKey) === 'true';

  function toggleDarkMode(){
    isDarkMode = !isDarkMode;
    localStorage.setItem(darkModeKey, isDarkMode);
    document.body.classList.toggle('dark-mode', isDarkMode);
  }

  // Initialize dark mode
  if(isDarkMode){
    document.body.classList.add('dark-mode');
  }

  // User posts management
  const userPostsKey = 'user_posts';
  let userPosts = JSON.parse(localStorage.getItem(userPostsKey)||'[]');

  function updateUserPostsCount(){
    document.getElementById('userPostsCount').textContent = userPosts.length;
  }

  function displayUserPostsInProfile(){
    const grid = document.getElementById('userPostsGrid');
    grid.innerHTML = '';
    userPosts.forEach(p=>{
      const div = document.createElement('div');
      div.className = 'user-post-item';
      div.innerHTML = `
        <img src="${p.imageData}" alt="${p.title}">
        <div class="post-overlay">
          <button class="btn-delete" data-id="${p.id}">🗑️</button>
        </div>
      `;
      div.querySelector('img').addEventListener('click',()=>{
        alert(`Post: ${p.title}\n${p.description}`);
      });
      grid.appendChild(div);
    });
  }

  function deleteUserPost(postId){
    if(confirm('Supprimer ce post ?')){
      userPosts = userPosts.filter(p => p.id !== postId);
      localStorage.setItem(userPostsKey, JSON.stringify(userPosts));
      updateUserPostsCount();
      displayUserPostsInProfile();
      injectPosts('all'); // Refresh feed
    }
  }

  // Create post form handling
  document.getElementById('postImage').addEventListener('change',e=>{
    const file = e.target.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = e=>{
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        preview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('createPostForm').addEventListener('submit',e=>{
    e.preventDefault();
    const form = e.target;
    const imageInput = document.getElementById('postImage');
    
    if(!imageInput.files[0]) return;
    
    const reader = new FileReader();
    reader.onload = e=>{
      const newPost = {
        id: Date.now(),
        user: 'Riche',
        loc: form.postLocation.value,
        img: e.target.result,
        caption: form.postDescription.value,
        category: form.postCategory.value,
        title: form.postTitle.value,
        imageData: e.target.result,
        description: form.postDescription.value,
        createdAt: new Date().toISOString()
      };
      
      userPosts.unshift(newPost); // Add to beginning
      localStorage.setItem(userPostsKey,JSON.stringify(userPosts));
      
      // Reset form
      form.reset();
      document.getElementById('imagePreview').classList.add('hidden');
      
      // Update UI
      updateUserPostsCount();
      displayUserPostsInProfile();
      
      // Refresh feed to show new post
      injectPosts('all');
      
      // Go to feed
      showPage('feed');
      
      alert('Post créé avec succès !');
    };
    reader.readAsDataURL(imageInput.files[0]);
  });

  const stories = [
    {id:1,user:'Riche',color:'#f09433',img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=6dd8e4870a0b3f0b3e0c9d3a7c3e6c74',items:[{type:'image',src:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=6dd8e4870a0b3f0b3e0c9d3a7c3e6c74'}]},
    {id:2,user:'Alice',color:'#bc1888',img:'https://images.unsplash.com/photo-1504198266285-165c2f3e3a4b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=abc123',items:[{type:'image',src:'https://images.unsplash.com/photo-1504198266285-165c2f3e3a4b?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=abc123'}]},
  ];

  // Language preservation data (Noongar example)
  const languageWords = [
    {id:1,noongar:'boorn',english:'kangaroo'},
    {id:2,noongar:'kaya',english:'hello'},
    {id:3,noongar:'boorda',english:'sun'},
    {id:4,noongar:'wardan',english:'whale'},
  ];

  const languageListEl = document.getElementById('languageList');
  const learnedKey = 'noongar_learned';
  const learned = JSON.parse(localStorage.getItem(learnedKey) || '[]');

  function renderLanguage(){
    languageListEl.innerHTML='';
    languageWords.forEach(w=>{
      const li = document.createElement('li');
      const known = learned.includes(w.id);
      li.innerHTML = `<div><strong class="listen" data-word="${w.noongar}" style="cursor:pointer">${w.noongar}</strong> — <small class="muted">${w.english}</small></div>`;
      const btn = document.createElement('button');
      btn.textContent = known ? 'Appris' : 'Marquer appris';
      if(known) btn.classList.add('learned');
      btn.addEventListener('click',()=>{
        if(learned.includes(w.id)){
          const idx = learned.indexOf(w.id); learned.splice(idx,1);
        } else {
          learned.push(w.id);
        }
        localStorage.setItem(learnedKey,JSON.stringify(learned));
        renderLanguage();
      });
      li.appendChild(btn);
      languageListEl.appendChild(li);
    });
    // attach listen handlers
    languageListEl.querySelectorAll('.listen').forEach(el=>{
      el.addEventListener('click',()=>{
        const text = el.dataset.word;
        if('speechSynthesis' in window){
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'en-AU';
          window.speechSynthesis.speak(u);
        } else {
          alert(text);
        }
      });
    });
  }
  renderLanguage();

  // contribute resource link (demo prompt)
  document.getElementById('contributeLink').addEventListener('click',e=>{
    e.preventDefault();
    const url = prompt('Ajouter un lien utile pour la préservation (URL) :');
    if(url){
      // for demo, store in sessionStorage and alert
      const key = 'contrib_resources';
      const list = JSON.parse(sessionStorage.getItem(key)||'[]');
      list.push({url,ts:Date.now()});
      sessionStorage.setItem(key,JSON.stringify(list));
      alert('Merci — ressource ajoutée (demo).');
    }
  });

  // --- Comptes dédiés à la culture Noongar ---
  const specializedAccounts = {
    education: {name: 'Éducation Culturelle', avatar: '📚', color: '#0b66c3'},
    preservation: {name: 'Préservation Noongar', avatar: '🛡️', color: '#16a34a'},
    artcraft: {name: 'Artisanat Traditionnel', avatar: '🎨', color: '#dc2626'},
    community: {name: 'Communauté Noongar', avatar: '🤝', color: '#7c3aed'}
  };

  const culturePosts = [
    {user:'Éducation Culturelle',account:'education',loc:'Perth Schools',img:'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=1200&auto=format&fit=crop',caption:'Programme scolaire : enseigner les mots Noongar aux enfants',category:'language'},
    {user:'Préservation Noongar',account:'preservation',loc:'South West WA',img:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',caption:'Documentation des récits traditionnels des anciens',category:'story'},
    {user:'Artisanat Traditionnel',account:'artcraft',loc:'Perth',img:'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1200&auto=format&fit=crop',caption:'Atelier de tissage avec les anciens : transmission du savoir-faire',category:'art'},
    {user:'Éducation Culturelle',account:'education',loc:'Albany',img:'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=1200&auto=format&fit=crop',caption:'Chorale communautaire : préserver la langue par la musique',category:'language'},
    {user:'Préservation Noongar',account:'preservation',loc:'Margaret River',img:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',caption:'Projet de conservation côtière : prendre soin du pays',category:'conservation'},
    {user:'Éducation Culturelle',account:'education',loc:'Denmark',img:'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200&auto=format&fit=crop',caption:'Enseigner les noms de lieux Noongar à la nouvelle génération',category:'language'},
    {user:'Artisanat Traditionnel',account:'artcraft',loc:'Fremantle',img:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop',caption:'Projet de fresque murale célébrant les histoires Noongar',category:'art'},
    {user:'Éducation Culturelle',account:'education',loc:'Bunbury',img:'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=1200&auto=format&fit=crop',caption:'Cours de Noongar : salutations de base et mots de la nature',category:'language'},
    {user:'Préservation Noongar',account:'preservation',loc:'Mandurah',img:'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=1200&auto=format&fit=crop',caption:'Cueillette de nourriture dans la brousse : connaissances traditionnelles',category:'conservation'},
    {user:'Communauté Noongar',account:'community',loc:'Perth',img:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',caption:'Festival culturel annuel : danse et artisanat',category:'story'},
    {user:'Préservation Noongar',account:'preservation',loc:'Bunbury',img:'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop',caption:'Histoire du Dreamtime : la création des rivières',category:'story'},
    {user:'Artisanat Traditionnel',account:'artcraft',loc:'Rural',img:'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop',caption:'Tissage de paniers avec des fibres naturelles',category:'art'},
    {user:'Artisanat Traditionnel',account:'artcraft',loc:'Perth',img:'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',caption:'Art contemporain inspiré des motifs Noongar',category:'art'},
    {user:'Communauté Noongar',account:'community',loc:'South West',img:'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop',caption:'Conseil des anciens : programmes de revitalisation linguistique',category:'story'},
    {user:'Préservation Noongar',account:'preservation',loc:'Coastline',img:'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop',caption:'Surveillance des espèces côtières : transmission des connaissances',category:'conservation'},
    {user:'Éducation Culturelle',account:'education',loc:'Region',img:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',caption:'Carte interactive des noms de lieux Noongar',category:'story'},
    {user:'Préservation Noongar',account:'preservation',loc:'Archive',img:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop',caption:'Enregistrement des histoires orales des anciens',category:'story'},
    {user:'Éducation Culturelle',account:'education',loc:'School',img:'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=1200&auto=format&fit=crop',caption:'Visite scolaire : apprendre des mots et des chansons',category:'language'},
    {user:'Communauté Noongar',account:'community',loc:'Trail',img:'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop',caption:'Marche patrimoniale guidée : nommer les sites en Noongar',category:'story'},
  ];

  const feedPlaceholder = document.getElementById('feedPlaceholder');

  // likes persistence
  const likesKey = 'culture_likes';
  const likesState = JSON.parse(localStorage.getItem(likesKey)||'{}');

  function injectPosts(filter){
    feedPlaceholder.innerHTML='';
    // Combine user posts with cultural posts
    const allPosts = [...userPosts, ...culturePosts];
    allPosts.forEach((p,idx)=>{
      if(filter && filter!=='all' && p.category !== filter) return;
      const art = document.createElement('article');
      art.className='post card';
      const postId = p.id ? `user-${p.id}` : `culture-${idx}`;
      art.dataset.id = postId;
      const title = p.title || p.caption.split(':')[0];
      const description = p.description || p.caption;
      
      // Get specialized avatar or default
      const avatar = p.account && specializedAccounts[p.account] ? 
        specializedAccounts[p.account].avatar : 
        (p.user.split(' ')[0][0] || 'N');
      
      const isUserPost = !!p.id;
      
      art.innerHTML = `
        <header class="post-head">
          <div class="avatar small ${p.account ? 'specialized' : ''}" ${p.account ? `style="background:${specializedAccounts[p.account].color}"` : ''}>${avatar}</div>
          <div>
            <b>${p.user}</b>
            <div class="location">${p.loc}</div>
          </div>
          ${isUserPost ? `<button class="btn-delete-post" data-id="${p.id}" title="Supprimer">🗑️</button>` : ''}
        </header>
        <div class="post-media">
          <img src="${p.img}" alt="${title}">
        </div>
        <div class="post-body">
          <h3 class="post-title">${title}</h3>
          <p class="post-summary">${description}</p>
        </div>
        <div class="post-actions">
          <button class="btn like heart-burst">♡ <span class="count">${likesState[postId] ?? Math.floor(Math.random()*200+10)}</span></button>
          <button class="btn btn-more" data-idx="${idx}" data-is-user="${isUserPost}">En savoir plus</button>
        </div>
        <div class="caption"><b>${p.user}</b> <div class="tags">#Noongar #Culture</div></div>
      `;
      feedPlaceholder.appendChild(art);
    });

    // attach like handlers to newly created posts
    feedPlaceholder.querySelectorAll('.post .like').forEach(btn=>{
      btn.addEventListener('click',e=>{
        const art = btn.closest('.post');
        const id = art.dataset.id;
        const countEl = btn.querySelector('.count');
        let count = parseInt(countEl.textContent,10);
        const liked = btn.classList.toggle('liked');
        count = liked ? count+1 : Math.max(0,count-1);
        countEl.textContent = count;
        btn.innerHTML = (liked ? '❤️ ' : '♡ ') + `<span class="count">${count}</span>`;
        // heart burst animation
        btn.classList.add('active');
        setTimeout(()=>btn.classList.remove('active'),350);
        // persist
        likesState[id] = count;
        localStorage.setItem(likesKey,JSON.stringify(likesState));
      });
    });
  }

  injectPosts('all');

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(b=>{
    b.addEventListener('click',()=>{
      document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      injectPosts(b.dataset.filter);
    });
  });

  const storiesEl = document.getElementById('stories');
  stories.forEach(s=>{
    const div = document.createElement('div');
    div.className='story';
    div.innerHTML = `<div class="avatar" style="background:${s.color}">${s.user[0]}</div><div class="name">${s.user}</div>`;
    div.addEventListener('click',()=>openStory(s));
    storiesEl.appendChild(div);
  });

  // likes
  document.querySelectorAll('.post .like').forEach(btn=>{
    btn.addEventListener('click',e=>{
      const liked = btn.classList.toggle('liked');
      const countEl = btn.querySelector('.count');
      let count = parseInt(countEl.textContent,10);
      count = liked ? count+1 : Math.max(0,count-1);
      countEl.textContent = count;
      btn.innerHTML = (liked ? '❤️ ' : '♡ ') + `<span class="count">${count}</span>`;
    });
  });

  // story modal
  const modal = document.getElementById('storyModal');
  const storyArea = document.getElementById('storyArea');
  document.getElementById('closeStory').addEventListener('click',closeStory);

  // post modal
  const postModal = document.getElementById('postModal');
  const postDetail = document.getElementById('postDetail');
  document.getElementById('closePost').addEventListener('click',()=>{ postModal.classList.add('hidden'); postModal.setAttribute('aria-hidden','true'); });

  // open post detail
  document.addEventListener('click',e=>{
    const more = e.target.closest('.btn-more');
    if(more){
      const idx = parseInt(more.dataset.idx,10);
      const isUserPost = more.dataset.isUser === 'true';
      const allPosts = [...userPosts, ...culturePosts];
      const p = allPosts[idx];
      const title = p.title || p.caption.split(':')[0];
      const description = p.description || p.caption;
      
      postDetail.innerHTML = `
        <img src="${p.img}" alt="${title}">
        <h2>${title}</h2>
        <p>${description}</p>
        <p><strong>Localisation:</strong> ${p.loc}</p>
        ${isUserPost ? 
          '<p><small>🎨 Post créé par toi</small></p>' :
          `<div class="cta-row">
            <button class="cta primary" id="supportBtn">Soutenir</button>
            <button class="cta secondary" id="learnMoreBtn">En savoir plus</button>
          </div>`
        }
      `;
      postModal.classList.remove('hidden');
      postModal.setAttribute('aria-hidden','false');

      if(!isUserPost){
        document.getElementById('supportBtn').addEventListener('click',()=>{
          window.open('https://example.com/donate','_blank');
        });
        document.getElementById('learnMoreBtn').addEventListener('click',()=>{
          alert('Page d\'information: (demo)');
        });
      }
    }
  });

  function openStory(s){
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
    storyArea.innerHTML = '';
    s.items.forEach(it=>{
      if(it.type==='image'){
        const img = document.createElement('img');
        img.src = it.src;
        img.style.maxWidth='360px';
        img.style.display='block';
        img.style.margin='0 auto';
        storyArea.appendChild(img);
      }
    });
  }
  function closeStory(){
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
  }

  // Event delegation for delete buttons
  document.addEventListener('click', e => {
    // Delete button in feed
    if(e.target.classList.contains('btn-delete-post')){
      const postId = parseInt(e.target.dataset.id);
      deleteUserPost(postId);
    }
    // Delete button in profile grid
    if(e.target.classList.contains('btn-delete')){
      const postId = parseInt(e.target.dataset.id);
      deleteUserPost(postId);
    }
  });

  // Dark mode toggle (will be added to topbar)
  window.toggleDarkMode = toggleDarkMode;
  
  // Initialize UI
  updateUserPostsCount();
  displayUserPostsInProfile();
});
