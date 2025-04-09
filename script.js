document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let contacts = [];
    let currentView = 'grid';
    let currentFilter = 'all';
    let currentCategory = 'all';
    let currentContactId = null;
    
    // Elementos del DOM
    const contactsList = document.getElementById('contactsList');
    const emptyState = document.getElementById('emptyState');
    const loader = document.getElementById('loader');
    const searchInput = document.getElementById('searchInput');
    const viewGridBtn = document.getElementById('viewGrid');
    const viewListBtn = document.getElementById('viewList');
    const categoryFilter = document.getElementById('categoryFilter');
    const filterPills = document.querySelectorAll('.filter-pill');
    const contactForm = document.getElementById('contactForm');
    const contactModal = new bootstrap.Modal(document.getElementById('contactModal'));
    const viewContactModal = new bootstrap.Modal(document.getElementById('viewContactModal'));
    const importExportModal = new bootstrap.Modal(document.getElementById('importExportModal'));
    const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    const addDemoModal = new bootstrap.Modal(document.getElementById('addDemoModal'));
    const toastNotification = new bootstrap.Toast(document.getElementById('toastNotification'));
    
    // Inicializar la aplicación
    initApp();
    
    function initApp() {
        
        loadContacts();
        
      
        setupEventListeners();
        
      
        toggleEmptyState();
    }
    
    function loadContacts() {
        showLoader();
        
        // Simular carga de datos
        setTimeout(() => {
            const savedContacts = localStorage.getItem('professionalContacts');
            if (savedContacts) {
                try {
                    contacts = JSON.parse(savedContacts);
                } catch (e) {
                    console.error("Error parsing contacts", e);
                    contacts = [];
                }
            }
            
            if (contacts.length === 0) {
                // Mostrar modal para añadir datos de demostración
                addDemoModal.show();
            }
            
            renderContacts();
            hideLoader();
        }, 500);
    }
    
    function saveContactsToLocalStorage() {
        localStorage.setItem('professionalContacts', JSON.stringify(contacts));
    }
    
    function showLoader() {
        loader.style.display = 'block';
        contactsList.style.display = 'none';
        emptyState.style.display = 'none';
    }
    
    function hideLoader() {
        loader.style.display = 'none';
        contactsList.style.display = 'flex';
    }
    
    function setupEventListeners() {
        // Botones de vista
        viewGridBtn.addEventListener('click', () => {
            currentView = 'grid';
            viewGridBtn.classList.add('active');
            viewListBtn.classList.remove('active');
            renderContacts();
        });
        
        viewListBtn.addEventListener('click', () => {
            currentView = 'list';
            viewListBtn.classList.add('active');
            viewGridBtn.classList.remove('active');
            renderContacts();
        });
        
        // Filtro de categoría
        categoryFilter.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            renderContacts();
        });
        
        // Píldoras de filtro
        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                filterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentFilter = pill.dataset.filter;
                renderContacts();
            });
        });
        
        // Búsqueda
        searchInput.addEventListener('input', debounce(() => {
            renderContacts();
        }, 300));
        
        // Botón de importar/exportar
        document.getElementById('importExportBtn').addEventListener('click', () => {
            importExportModal.show();
        });
        
        // Botón de exportar
        document.getElementById('exportBtn').addEventListener('click', exportContacts);
        
        // Botón de importar
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importInput').click();
        });
        
        document.getElementById('importInput').addEventListener('change', importContacts);
        
        // Botón de añadir demo
        document.getElementById('confirmAddDemo').addEventListener('click', addDemoContacts);
        
        // Formulario de contacto
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveContact();
        });
        
        // Botón de guardar contacto
        document.getElementById('saveContact').addEventListener('click', () => {
            contactForm.requestSubmit();
        });
        
        // Selector de avatar
        document.getElementById('avatarPreview').addEventListener('click', () => {
            document.getElementById('avatarInput').click();
        });
        
        document.getElementById('avatarInput').addEventListener('change', handleAvatarUpload);
        
        // Añadir etiquetas
        document.getElementById('addTagBtn').addEventListener('click', addTag);
        document.getElementById('tagInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
            }
        });
        
        // Botón de eliminar contacto
        document.getElementById('deleteContact').addEventListener('click', () => {
            const contact = contacts.find(c => c.id === currentContactId);
            if (contact) {
                document.getElementById('deleteContactName').textContent = `${contact.firstName} ${contact.lastName}`;
                deleteConfirmModal.show();
            }
        });
        
        // Confirmar eliminación
        document.getElementById('confirmDelete').addEventListener('click', deleteCurrentContact);
        
        // Botón de editar contacto
        document.getElementById('editContact').addEventListener('click', () => {
            viewContactModal.hide();
            editContact(currentContactId);
        });
    }
    
    function renderContacts() {
        let filteredContacts = [...contacts];
        const searchTerm = searchInput.value.toLowerCase();
        
        // Aplicar filtros
        if (currentFilter === 'favorites') {
            filteredContacts = filteredContacts.filter(contact => contact.favorite);
        } else if (currentFilter === 'recent') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            filteredContacts = filteredContacts.filter(contact => {
                const contactDate = new Date(contact.updatedAt || contact.createdAt);
                return contactDate > oneMonthAgo;
            });
        }
        
        // Aplicar filtro de categoría
        if (currentCategory !== 'all') {
            filteredContacts = filteredContacts.filter(contact => contact.category === currentCategory);
        }
        
        // Aplicar búsqueda
        if (searchTerm) {
            filteredContacts = filteredContacts.filter(contact => 
                `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm) ||
                (contact.email && contact.email.toLowerCase().includes(searchTerm)) ||
                (contact.company && contact.company.toLowerCase().includes(searchTerm)) ||
                (contact.jobTitle && contact.jobTitle.toLowerCase().includes(searchTerm)) ||
                (contact.tags && contact.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }
        
        // Limpiar lista
        contactsList.innerHTML = '';
        
        // Mostrar empty state si no hay contactos
        if (filteredContacts.length === 0) {
            contactsList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        contactsList.style.display = currentView === 'grid' ? 'flex' : 'block';
        emptyState.style.display = 'none';
        
        // Renderizar contactos según la vista actual
        if (currentView === 'grid') {
            renderGridView(filteredContacts);
        } else {
            renderListView(filteredContacts);
        }
    }
    
    function renderGridView(contactsToRender) {
        contactsList.classList.remove('list-view');
        contactsList.classList.add('grid-view');
        
        contactsToRender.forEach(contact => {
            const contactCard = document.createElement('div');
            contactCard.className = 'col-md-6 col-lg-4';
            contactCard.innerHTML = `
                <div class="contact-card card h-100">
                    <div class="card-header position-relative">
                        <div class="d-flex align-items-center">
                            <img src="${contact.avatar || 'https://via.placeholder.com/80'}" 
                                 alt="${contact.firstName} ${contact.lastName}" 
                                 class="contact-avatar me-3">
                            <div>
                                <h5 class="mb-0">${contact.firstName} ${contact.lastName}</h5>
                                <small class="text-white-50">${contact.jobTitle || 'Sin cargo'} ${contact.company ? 'en ' + contact.company : ''}</small>
                            </div>
                        </div>
                        <div class="contact-actions">
                            <button class="btn btn-sm btn-light me-1" data-id="${contact.id}" data-action="view">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-light" data-id="${contact.id}" data-action="edit">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-2">
                            <i class="fas fa-envelope me-2 text-muted"></i>
                            <a href="mailto:${contact.email}">${contact.email}</a>
                        </div>
                        ${contact.phone ? `
                        <div class="mb-2">
                            <i class="fas fa-phone me-2 text-muted"></i>
                            <a href="tel:${contact.phone}">${contact.phone}</a>
                        </div>` : ''}
                        <div class="d-flex flex-wrap mt-3">
                            <span class="badge rounded-pill bg-${getCategoryColor(contact.category)} me-2 mb-2">
                                ${getCategoryName(contact.category)}
                            </span>
                            ${contact.tags && contact.tags.map(tag => `
                                <span class="tag">${tag}</span>
                            `).join('')}
                        </div>
                    </div>
                    <button class="favorite-btn ${contact.favorite ? 'active' : ''}" data-id="${contact.id}">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
            `;
            contactsList.appendChild(contactCard);
        });
        
        // Agregar event listeners a los botones de las tarjetas
        addCardEventListeners();
    }
    
    function renderListView(contactsToRender) {
        contactsList.classList.remove('grid-view');
        contactsList.classList.add('list-view');
        contactsList.innerHTML = '<div class="col-12"></div>';
        const listContainer = contactsList.firstChild;
        
        contactsToRender.forEach(contact => {
            const contactItem = document.createElement('div');
            contactItem.className = 'contact-list-item';
            contactItem.innerHTML = `
                <div class="flex-shrink-0 me-3">
                    <img src="${contact.avatar || 'https://via.placeholder.com/50'}" 
                         alt="${contact.firstName} ${contact.lastName}" 
                         class="contact-avatar-sm">
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">${contact.firstName} ${contact.lastName}</h5>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-1" data-id="${contact.id}" data-action="view">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-primary" data-id="${contact.id}" data-action="edit">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                    <div class="text-muted small">
                        ${contact.jobTitle || 'Sin cargo'} ${contact.company ? 'en ' + contact.company : ''}
                    </div>
                    <div class="mt-2">
                        <span class="badge rounded-pill bg-${getCategoryColor(contact.category)} me-2">
                            ${getCategoryName(contact.category)}
                        </span>
                        ${contact.tags && contact.tags.map(tag => `
                            <span class="tag">${tag}</span>
                        `).join('')}
                    </div>
                </div>
                <button class="favorite-btn ${contact.favorite ? 'active' : ''}" data-id="${contact.id}">
                    <i class="fas fa-star"></i>
                </button>
            `;
            listContainer.appendChild(contactItem);
        });
        
        // Agregar event listeners a los botones de los items
        addCardEventListeners();
    }
    
    function addCardEventListeners() {
        // Botones de acción (ver/editar)
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contactId = btn.dataset.id;
                const action = btn.dataset.action;
                
                if (action === 'view') {
                    viewContact(contactId);
                } else if (action === 'edit') {
                    editContact(contactId);
                }
            });
        });
        
        // Botones de favorito
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const contactId = btn.dataset.id;
                toggleFavorite(contactId);
            });
        });
        
        // Hacer clic en el item de lista
        document.querySelectorAll('.contact-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const contactId = item.querySelector('[data-id]')?.dataset.id;
                    if (contactId) viewContact(contactId);
                }
            });
        });
    }
    
    function toggleEmptyState() {
        if (contacts.length === 0) {
            contactsList.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            contactsList.style.display = 'flex';
            emptyState.style.display = 'none';
        }
    }
    
    function viewContact(contactId) {
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) return;
        
        currentContactId = contactId;
        
        // Actualizar modal de vista
        document.getElementById('viewModalTitle').textContent = `${contact.firstName} ${contact.lastName}`;
        document.getElementById('viewAvatar').src = contact.avatar || 'https://via.placeholder.com/200';
        document.getElementById('viewFullName').textContent = `${contact.firstName} ${contact.lastName}`;
        document.getElementById('viewJobInfo').textContent = 
            `${contact.jobTitle || 'Sin cargo'}${contact.company ? ' en ' + contact.company : ''}`;
        
        // Categoría
        const categoryBadge = document.getElementById('viewCategoryBadge');
        categoryBadge.innerHTML = `
            <span class="badge rounded-pill bg-${getCategoryColor(contact.category)}">
                ${getCategoryName(contact.category)}
            </span>
        `;
        
        // Etiquetas
        const tagsContainer = document.getElementById('viewTagsContainer');
        tagsContainer.innerHTML = '';
        if (contact.tags && contact.tags.length > 0) {
            contact.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'badge bg-light text-dark me-2 mb-2';
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
        }
        
        // Información de contacto
        document.getElementById('viewEmail').textContent = contact.email || 'No especificado';
        document.getElementById('viewPhone').textContent = contact.phone || 'No especificado';
        document.getElementById('viewAddress').textContent = 
            `${contact.address || ''}${contact.city ? ', ' + contact.city : ''}${contact.country ? ', ' + contact.country : ''}`.trim() || 'No especificado';
        document.getElementById('viewBirthday').textContent = 
            contact.birthday ? formatDate(contact.birthday) : 'No especificado';
        
        // Notas
        document.getElementById('viewNotes').textContent = contact.notes || 'Sin notas';
        
        // Fecha de actualización
        const updatedAt = contact.updatedAt || contact.createdAt;
        document.getElementById('viewLastUpdate').textContent = 
            `Última actualización: ${formatDate(updatedAt)}`;
        
        // Mostrar modal
        viewContactModal.show();
    }
    
    function editContact(contactId) {
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) {
            // Nuevo contacto
            resetContactForm();
            document.getElementById('modalTitle').textContent = 'Nuevo Contacto';
            contactModal.show();
            return;
        }
        
        currentContactId = contactId;
        
        // Actualizar formulario con los datos del contacto
        document.getElementById('modalTitle').textContent = 'Editar Contacto';
        document.getElementById('contactId').value = contact.id;
        document.getElementById('firstName').value = contact.firstName;
        document.getElementById('lastName').value = contact.lastName;
        document.getElementById('email').value = contact.email;
        document.getElementById('phone').value = contact.phone;
        document.getElementById('company').value = contact.company || '';
        document.getElementById('jobTitle').value = contact.jobTitle || '';
        document.getElementById('category').value = contact.category;
        document.getElementById('birthday').value = contact.birthday || '';
        document.getElementById('address').value = contact.address || '';
        document.getElementById('city').value = contact.city || '';
        document.getElementById('country').value = contact.country || '';
        document.getElementById('notes').value = contact.notes || '';
        document.getElementById('favorite').checked = contact.favorite || false;
        
        // Avatar
        const avatarPreview = document.getElementById('avatarPreview');
        avatarPreview.src = contact.avatar || 'https://via.placeholder.com/200';
        document.getElementById('avatarUrl').value = contact.avatar || '';
        
        // Etiquetas
        const tagsContainer = document.getElementById('tagsContainer');
        tagsContainer.innerHTML = '';
        if (contact.tags && contact.tags.length > 0) {
            contact.tags.forEach(tag => {
                addTagToContainer(tag);
            });
        }
        
        // Mostrar modal
        contactModal.show();
    }
    
    function resetContactForm() {
        document.getElementById('contactForm').reset();
        document.getElementById('contactId').value = '';
        document.getElementById('tagsContainer').innerHTML = '';
        document.getElementById('avatarPreview').src = 'https://via.placeholder.com/200';
        document.getElementById('avatarUrl').value = '';
    }
    
    function saveContact() {
        const contactId = document.getElementById('contactId').value;
        const isNew = !contactId;
        
        // Obtener valores del formulario
        const contact = {
            id: contactId || generateId(),
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            company: document.getElementById('company').value.trim(),
            jobTitle: document.getElementById('jobTitle').value.trim(),
            category: document.getElementById('category').value,
            birthday: document.getElementById('birthday').value,
            address: document.getElementById('address').value.trim(),
            city: document.getElementById('city').value.trim(),
            country: document.getElementById('country').value.trim(),
            notes: document.getElementById('notes').value.trim(),
            favorite: document.getElementById('favorite').checked,
            avatar: document.getElementById('avatarUrl').value,
            tags: Array.from(document.querySelectorAll('#tagsContainer .chip')).map(chip => chip.dataset.tag),
            createdAt: isNew ? new Date().toISOString() : contacts.find(c => c.id === contactId).createdAt,
            updatedAt: new Date().toISOString()
        };
        
        // Validación básica
        if (!contact.firstName || !contact.lastName || !contact.email) {
            showToast('Error', 'Por favor completa los campos obligatorios (Nombre, Apellido y Email)', 'danger');
            return;
        }
        
        if (!validateEmail(contact.email)) {
            showToast('Error', 'Por favor ingresa un email válido', 'danger');
            return;
        }
        
        // Guardar contacto
        if (isNew) {
            contacts.push(contact);
        } else {
            const index = contacts.findIndex(c => c.id === contactId);
            if (index !== -1) {
                contacts[index] = contact;
            }
        }
        
        // Guardar en localStorage
        saveContactsToLocalStorage();
        
        // Actualizar vista
        renderContacts();
        
        // Cerrar modal y mostrar notificación
        contactModal.hide();
        showToast(
            'Éxito', 
            `Contacto ${isNew ? 'añadido' : 'actualizado'} correctamente`, 
            'success'
        );
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function deleteCurrentContact() {
        const index = contacts.findIndex(c => c.id === currentContactId);
        if (index !== -1) {
            contacts.splice(index, 1);
            saveContactsToLocalStorage();
            renderContacts();
            deleteConfirmModal.hide();
            viewContactModal.hide();
            showToast('Éxito', 'Contacto eliminado correctamente', 'success');
        }
    }
    
    function toggleFavorite(contactId) {
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
            contact.favorite = !contact.favorite;
            contact.updatedAt = new Date().toISOString();
            saveContactsToLocalStorage();
            renderContacts();
            
            showToast(
                'Favorito', 
                `Contacto ${contact.favorite ? 'añadido a' : 'eliminado de'} favoritos`, 
                'info'
            );
        }
    }
    
    function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Simular subida de imagen (en una app real se subiría a un servidor)
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('avatarPreview').src = event.target.result;
            document.getElementById('avatarUrl').value = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function addTag() {
        const tagInput = document.getElementById('tagInput');
        const tag = tagInput.value.trim();
        
        if (tag && !Array.from(document.querySelectorAll('#tagsContainer .chip'))
            .some(chip => chip.dataset.tag.toLowerCase() === tag.toLowerCase())) {
            addTagToContainer(tag);
            tagInput.value = '';
        }
    }
    
    function addTagToContainer(tag) {
        const tagsContainer = document.getElementById('tagsContainer');
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.dataset.tag = tag;
        chip.innerHTML = `
            ${tag}
            <span class="chip-delete" data-tag="${tag}">
                <i class="fas fa-times"></i>
            </span>
        `;
        tagsContainer.appendChild(chip);
        
        // Agregar event listener al botón de eliminar
        chip.querySelector('.chip-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            chip.remove();
        });
    }
    
    function exportContacts() {
        const dataStr = JSON.stringify(contacts, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `contactos-profesionales-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        importExportModal.hide();
        showToast('Éxito', 'Contactos exportados correctamente', 'success');
    }
    
    function importContacts(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedContacts = JSON.parse(event.target.result);
                
                if (!Array.isArray(importedContacts)) {
                    throw new Error('Formato de archivo inválido');
                }
                
                // Validar estructura básica de los contactos
                const isValid = importedContacts.every(contact => 
                    contact.firstName && contact.lastName && contact.email
                );
                
                if (!isValid) {
                    throw new Error('El archivo no contiene contactos válidos');
                }
                
                // Asignar nuevos IDs para evitar conflictos
                const contactsWithNewIds = importedContacts.map(contact => ({
                    ...contact,
                    id: generateId(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }));
                
                // Agregar contactos importados
                contacts = [...contacts, ...contactsWithNewIds];
                saveContactsToLocalStorage();
                renderContacts();
                
                importExportModal.hide();
                showToast('Éxito', `${importedContacts.length} contactos importados correctamente`, 'success');
            } catch (error) {
                showToast('Error', 'No se pudo importar el archivo: ' + error.message, 'danger');
            }
        };
        reader.readAsText(file);
    }
    
    function addDemoContacts() {
        const demoContacts = [
            {
                id: generateId(),
                firstName: 'Ana',
                lastName: 'Gómez',
                email: 'ana.gomez@example.com',
                phone: '+34 600 123 456',
                company: 'Tech Solutions',
                jobTitle: 'Desarrolladora Frontend',
                category: 'work',
                birthday: '1990-05-15',
                address: 'Calle Principal 123',
                city: 'Madrid',
                country: 'España',
                notes: 'Experta en React y Vue.js. Contactar para proyectos web.',
                favorite: true,
                tags: ['desarrollo', 'frontend', 'react'],
                avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                firstName: 'Carlos',
                lastName: 'Martínez',
                email: 'carlos.martinez@example.com',
                phone: '+34 699 987 654',
                company: 'Digital Marketing Pro',
                jobTitle: 'Director de Marketing',
                category: 'business',
                birthday: '1985-11-22',
                address: 'Avenida Central 45',
                city: 'Barcelona',
                country: 'España',
                notes: 'Especializado en marketing digital y redes sociales.',
                favorite: false,
                tags: ['marketing', 'redes-sociales', 'seo'],
                avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                firstName: 'Laura',
                lastName: 'Fernández',
                email: 'laura.fernandez@example.com',
                phone: '+34 622 555 789',
                company: '',
                jobTitle: 'Diseñadora UX/UI',
                category: 'friend',
                birthday: '1992-08-30',
                address: 'Plaza Mayor 7',
                city: 'Valencia',
                country: 'España',
                notes: 'Amiga de la universidad. Excelente diseñadora.',
                favorite: true,
                tags: ['diseño', 'ux', 'amigos'],
                avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                firstName: 'Pedro',
                lastName: 'López',
                email: 'pedro.lopez@example.com',
                phone: '+34 677 222 333',
                company: 'Consultoría López',
                jobTitle: 'Consultor Financiero',
                category: 'business',
                birthday: '1978-03-10',
                address: 'Calle Secundaria 89',
                city: 'Sevilla',
                country: 'España',
                notes: 'Contacto de networking. Buenas oportunidades de negocio.',
                favorite: false,
                tags: ['finanzas', 'consultoría', 'negocios'],
                avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                firstName: 'María',
                lastName: 'Rodríguez',
                email: 'maria.rodriguez@example.com',
                phone: '+34 655 444 111',
                company: '',
                jobTitle: '',
                category: 'family',
                birthday: '1982-12-05',
                address: 'Calle Familiar 12',
                city: 'Bilbao',
                country: 'España',
                notes: 'Prima. Contacto familiar importante.',
                favorite: true,
                tags: ['familia', 'reuniones'],
                avatar: 'https://randomuser.me/api/portraits/women/25.jpg',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        contacts = [...contacts, ...demoContacts];
        saveContactsToLocalStorage();
        renderContacts();
        addDemoModal.hide();
        showToast('Éxito', 'Contactos de demostración añadidos', 'success');
    }
    
    // Funciones auxiliares
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    function showToast(title, message, type = 'info') {
        const toastHeader = document.querySelector('#toastNotification .toast-header');
        toastHeader.className = `toast-header bg-${type} text-white`;
        
        document.getElementById('toastTitle').textContent = title;
        document.getElementById('toastMessage').textContent = message;
        toastNotification.show();
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
    
    function getCategoryName(category) {
        const names = {
            work: 'Trabajo',
            family: 'Familia',
            friend: 'Amigo',
            business: 'Negocio',
            other: 'Otro'
        };
        return names[category] || category;
    }
    
    function getCategoryColor(category) {
        const colors = {
            work: 'primary',
            family: 'success',
            friend: 'info',
            business: 'warning',
            other: 'secondary'
        };
        return colors[category] || 'light';
    }
});