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
    if(confirm('Delete this post?')){
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
      
      alert('Post created successfully!');
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
      btn.textContent = known ? 'Learned' : 'Mark as learned';
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
    const url = prompt('Add a useful link for preservation (URL) :');
    if(url){
      // for demo, store in sessionStorage and alert
      const key = 'contrib_resources';
      const list = JSON.parse(sessionStorage.getItem(key)||'[]');
      list.push({url,ts:Date.now()});
      sessionStorage.setItem(key,JSON.stringify(list));
      alert('Thank you — resource added (demo).');
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
  {user:'Éducation Culturelle',account:'education',loc:'Perth Schools',img:'assets/012523PD-JPG1.jpg',caption:'Noongar children learning in school',category:'language'},
  {user:'Préservation Noongar',account:'preservation',loc:'South West WA',img:'assets/960.webp',caption:'Noongar land and nature',category:'story'},
  {user:'Artisanat Traditionnel',account:'artcraft',loc:'Perth',img:'assets/a_230211gennoongar02.jpg',caption:'Traditional Noongar art and crafts',category:'art'},
  {user:'Éducation Culturelle',account:'education',loc:'Albany',img:'assets/familli1.jpeg',caption:'Noongar family gathering',category:'language'},
  {user:'Préservation Noongar',account:'preservation',loc:'Margaret River',img:'assets/images.jpg',caption:'Noongar stories and legends',category:'story'},
  {user:'Éducation Culturelle',account:'education',loc:'Denmark',img:'assets/Keeping Noongar alive.webp',caption:'Keeping Noongar language alive',category:'language'},
  {user:'Artisanat Traditionnel',account:'artcraft',loc:'Fremantle',img:'assets/Noongar-6-seasons-series-III.jpg',caption:'Noongar six seasons explained',category:'art'},
  {user:'Éducation Culturelle',account:'education',loc:'Bunbury',img:'assets/noongar.gif',caption:'Noongar language in motion',category:'language'},
  {user:'Préservation Noongar',account:'preservation',loc:'Mandurah',img:'assets/Noongar5.23.jpg',caption:'Noongar heritage and preservation',category:'story'},
  {user:'Communauté Noongar',account:'community',loc:'Perth',img:'assets/Olman_Walley_Noongar_Performer.jpg',caption:'Noongar performer sharing culture',category:'story'},
  {user:'Préservation Noongar',account:'preservation',loc:'Bunbury',img:'assets/SWNTS+areas.webp',caption:'Noongar territory and regions',category:'story'},
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
      art.className='post';
      const postId = p.id ? `user-${p.id}` : `culture-${idx}`;
      const title = p.title || p.caption.split(':')[0];
      const description = p.description || p.caption;
      // Avatar stylé
      let avatar = `<div class='post-avatar'>${p.user[0]}</div>`;
      if(p.account === 'preservation') avatar = `<div class='post-avatar' style='background:linear-gradient(135deg,#16a34a 0%,#7c3aed 100%)'>🛡️</div>`;
      if(p.account === 'education') avatar = `<div class='post-avatar' style='background:linear-gradient(135deg,#0b66c3 0%,#bc1888 100%)'>📚</div>`;
      if(p.account === 'artcraft') avatar = `<div class='post-avatar' style='background:linear-gradient(135deg,#dc2626 0%,#bc1888 100%)'>🎨</div>`;
      if(p.account === 'community') avatar = `<div class='post-avatar' style='background:linear-gradient(135deg,#7c3aed 0%,#16a34a 100%)'>🤝</div>`;
      if(p.user === 'Riche') avatar = `<div class='post-avatar'>RK</div>`;

      art.innerHTML = `
        <div class="post-header">
          ${avatar}
          <div class="post-user-info">
            <a href="#" class="post-username">${p.user}</a>
            <div class="post-location">${p.loc}</div>
          </div>
          <button class="post-options">⋯</button>
        </div>
        <div class="post-image-container">
          <img src="${p.img}" alt="${title}" class="post-image">
        </div>
        <div class="post-actions">
          <div class="post-actions-left">
            <button class="action-btn like-btn">
              <!-- Instagram heart SVG -->
              <svg aria-label="J’aime" fill="none" height="24" viewBox="0 0 24 24" width="24"><path d="M16.792 3.906c-1.64 0-3.093.81-4.043 2.09-.95-1.28-2.403-2.09-4.043-2.09C5.01 3.906 2.75 6.166 2.75 8.906c0 4.28 7.25 9.188 7.25 9.188s7.25-4.908 7.25-9.188c0-2.74-2.26-5-5.208-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </button>
            <button class="action-btn">
              <!-- Instagram comment SVG -->
              <svg aria-label="Commenter" fill="none" height="24" viewBox="0 0 24 24" width="24"><path d="M21.5 12c0 4.694-4.306 8.5-9.5 8.5a9.77 9.77 0 0 1-4.2-.93l-4.3 1.13a.75.75 0 0 1-.93-.93l1.13-4.3A9.77 9.77 0 0 1 2.5 12c0-4.694 4.306-8.5 9.5-8.5s9.5 3.806 9.5 8.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </button>
            <button class="action-btn">
              <!-- Instagram send SVG -->
              <svg aria-label="Partager" fill="none" height="24" viewBox="0 0 24 24" width="24"><path d="M22 3L2 12.5l7.5 2.5L17 21l5-18z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </button>
          </div>
          <button class="action-btn">
            <!-- Instagram bookmark SVG -->
            <svg aria-label="Enregistrer" fill="none" height="24" viewBox="0 0 24 24" width="24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>
        <div class="post-likes">
          <span class="likes-count">${likesState[postId] ?? Math.floor(Math.random()*200+10)} likes</span>
        </div>
        <div class="post-caption">
          <span class="caption-username">${p.user}</span>
          <span class="caption-text">${description}</span>
        </div>
        <button class="post-comments-btn view-comments" data-idx="${idx}" data-is-user="${!!p.id}">View 12 comments</button>
        <div class="post-time">${Math.floor(Math.random()*24+1)} HOURS AGO</div>
      `;
      feedPlaceholder.appendChild(art);
    });

    // attach like handlers to newly created posts
    feedPlaceholder.querySelectorAll('.post .like-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{
        const art = btn.closest('.post');
        const id = art.dataset.id;
        const likesCountEl = art.querySelector('.likes-count');
        const heartIcon = btn.querySelector('.heart-icon');
        
        let countText = likesCountEl.textContent;
        let count = parseInt(countText.split(' ')[0], 10);
        
        const liked = btn.classList.toggle('liked');
        count = liked ? count+1 : Math.max(0,count-1);
        
        likesCountEl.textContent = `${count} likes`;
        heartIcon.textContent = liked ? '❤️' : '♡';
        
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
      document.querySelectorAll('.filter-btn').forEach(x=>{
        x.classList.remove('active');
        x.style.background = 'white';
        x.style.color = 'var(--gray-800)';
      });
      b.classList.add('active');
      b.style.background = 'var(--blue)';
      b.style.color = 'white';
      injectPosts(b.dataset.filter);
    });
  });

  // Stories
  const storiesEl = document.getElementById('stories');
  storiesEl.innerHTML = '';
  const storyAccounts = [
    {name: 'Riche', avatar: 'RK'},
    {name: 'Alice', avatar: '<svg width="32" height="32" viewBox="0 0 32 32"><rect x="6" y="6" width="20" height="20" rx="4" fill="#6ee7b7"/><rect x="12" y="12" width="8" height="8" rx="2" fill="#3b82f6"/></svg>'}
  ];
  storyAccounts.forEach(acc => {
    const div = document.createElement('div');
    div.className = 'story';
    div.innerHTML = `
      <div class="story-avatar">
        <div class="post-avatar">${acc.avatar}</div>
      </div>
      <div class="story-username">${acc.name}</div>
    `;
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
    const more = e.target.closest('.view-comments');
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
        <p><strong>Location:</strong> ${p.loc}</p>
        ${isUserPost ? 
          '<p><small>🎨 Post created by you</small></p>' :
          `<div class="cta-row">
            <button class="cta primary" id="supportBtn">Support</button>
            <button class="cta secondary" id="learnMoreBtn">Learn more</button>
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
          alert('Information page: (demo)');
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
  
  // Profile navigation
  function setupProfileNavigation() {
    // Add click handlers for usernames and avatars to navigate to profiles
    document.addEventListener('click', e => {
      const isUsername = e.target.classList.contains('username') && !e.target.closest('.sidebar-profile');
      const isAvatar = e.target.classList.contains('avatar') && !e.target.closest('.sidebar-profile') && e.target.closest('.post');
      
      if(isUsername || isAvatar) {
        e.preventDefault();
        const postElement = e.target.closest('.post');
        if(postElement) {
          const usernameEl = postElement.querySelector('.username');
          const username = usernameEl ? usernameEl.textContent : '';
          
          // Check if it's a specialized account
          const accountType = Object.keys(specializedAccounts).find(key => 
            specializedAccounts[key].name.toLowerCase().replace(/\s+/g, '_') === username
          );
          
          if(accountType) {
            showSpecializedProfile(accountType, specializedAccounts[accountType].name);
          } else {
            showUserProfile(username);
          }
        }
      }
    });
  }

  function showSpecializedProfile(accountType, username) {
    const account = specializedAccounts[accountType];
    const posts = culturePosts.filter(p => p.account === accountType);
    
    alert(`Profile of ${username}\n\n${account.avatar} Specialized account for Noongar cultural preservation\n\n${posts.length} posts\n500+ followers\n\nMission: Preserve and transmit Noongar culture to new generations.`);
  }

  function showUserProfile(username) {
    if(username === 'Riche') {
      // Navigate to main profile page
      showPage('profile');
    } else {
      alert(`Profile of ${username}\n\nUser account\nMember of the cultural preservation community`);
    }
  }

  // Upload placeholder interaction
  function setupUploadPlaceholder() {
    const placeholder = document.getElementById('uploadPlaceholder');
    const fileInput = document.getElementById('postImage');
    
    if(placeholder && fileInput) {
      // Drag and drop
      placeholder.addEventListener('dragover', e => {
        e.preventDefault();
        placeholder.style.borderColor = 'var(--ig-primary-button)';
      });
      
      placeholder.addEventListener('dragleave', e => {
        e.preventDefault();
        placeholder.style.borderColor = 'var(--ig-stroke)';
      });
      
      placeholder.addEventListener('drop', e => {
        e.preventDefault();
        placeholder.style.borderColor = 'var(--ig-stroke)';
        
        const files = e.dataTransfer.files;
        if(files.length > 0) {
          fileInput.files = files;
          handleImagePreview({target: fileInput});
        }
      });
    }
  }

  function handleImagePreview(e) {
    const file = e.target.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onload = e => {
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('uploadPlaceholder');
        
        if(preview && placeholder) {
          preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width:100%;border-radius:8px;">`;
          preview.classList.remove('hidden');
          placeholder.style.display = 'none';
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Update the existing image change handler
  document.getElementById('postImage').removeEventListener('change', document.getElementById('postImage').onchange);
  document.getElementById('postImage').addEventListener('change', handleImagePreview);

  // Profile tabs functionality
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tab = btn.dataset.tab;
      if(tab === 'posts') {
        displayUserPostsInProfile();
      } else {
        document.getElementById('userPostsGrid').innerHTML = '<p style="text-align:center;color:var(--ig-secondary-text);padding:40px;">No content in this section</p>';
      }
    });
  });

  // Follow button functionality for suggestions
  document.querySelectorAll('.follow-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = btn.textContent === 'Suivre' ? 'Suivi' : 'Suivre';
      btn.style.backgroundColor = btn.textContent === 'Suivi' ? 'transparent' : 'var(--ig-primary-button)';
      btn.style.color = btn.textContent === 'Suivi' ? 'var(--ig-primary-text)' : 'white';
    });
  });

  // Header navigation icons (desktop)
  document.querySelectorAll('.header-nav .nav-icon, .header-nav .post-avatar').forEach(btn => {
    if(btn.dataset.page) {
      btn.addEventListener('click', () => {
        showPage(btn.dataset.page);
      });
    }
  });

  // Navigation to profile from post
  document.addEventListener('click', function(e) {
    const usernameEl = e.target.closest('.post-username');
    const avatarEl = e.target.closest('.post-avatar');
    const postEl = e.target.closest('.post');
    if ((usernameEl || avatarEl) && postEl) {
      e.preventDefault();
      const name = postEl.querySelector('.post-username').textContent.trim();
      showDynamicProfile(name);
    }
  });

  function showDynamicProfile(username) {
    // Find posts by this user
    const allPosts = [...userPosts, ...culturePosts];
    const userPostsList = allPosts.filter(p => p.user === username);
    // Fill profile info
    document.getElementById('dynamicProfileUsername').textContent = username;
    document.getElementById('dynamicProfileAvatar').textContent = username === 'Riche' ? 'RK' : username[0];
    document.getElementById('dynamicProfilePostsCount').textContent = userPostsList.length;
    document.getElementById('dynamicProfileFollowers').textContent = Math.floor(Math.random()*500+100);
    document.getElementById('dynamicProfileFollowing').textContent = Math.floor(Math.random()*200+50);
    document.getElementById('dynamicProfileBio').textContent = (username === 'Riche') ? 'Noongar culture enthusiast. Sharing stories and language.' : 'Member of the Noongar cultural community.';
    // Fill posts grid
    const grid = document.getElementById('dynamicUserPostsGrid');
    grid.innerHTML = '';
    if(userPostsList.length === 0) {
      grid.innerHTML = '<p style="text-align:center;color:var(--ig-secondary-text);padding:40px;">No posts yet.</p>';
    } else {
      userPostsList.forEach(p => {
        const div = document.createElement('div');
        div.className = 'user-post-item';
        div.innerHTML = `<img src="${p.img}" alt="${p.title||p.caption}">`;
        grid.appendChild(div);
      });
    }
    // Show the dynamic profile page
    showPage('dynamicProfile');
  }

  // Initialize UI
  updateUserPostsCount();
  displayUserPostsInProfile();
  setupProfileNavigation();
  setupUploadPlaceholder();
});
