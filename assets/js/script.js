function reloadPage () {
    location.reload();
}

const to_do_form = document.querySelector('#to-do-form');
const span = document.querySelector('#validation-message');

function validateTodo(text_parameter) {
    const text = text_parameter.trim();
    if (text === '') {
        span.innerText = `Please don't leave it empty, write something!`;
        span.style.display = 'inline';
        return false;
    }
    else if (text.length >= 100) {
        span.innerText = 'To-do must be <100 characters!';
        span.style.display = 'inline';
        return false;
    }
    else if (getTodos().filter(todo => todo.text === text).length > 0) {
        span.innerText = 'This to-do is already in the list!';
        span.style.display = 'inline';
        return false;
    }
    else {
        span.style.display = 'none';
        return true;
    }
}

function getTodos () {
    return JSON.parse(localStorage.getItem('todos')) ?? []
}

//Filters
const done = document.querySelector('#done');
const undone = document.querySelector('#undone');
const undone_done_both = document.querySelector('#undone-done-both');
done.addEventListener('click', e => {
        sessionStorage.setItem('status', 'done');
        reloadPage()
})
undone.addEventListener('click', e => {
        sessionStorage.setItem('status', 'undone');
        reloadPage()
})
undone_done_both.addEventListener('click', e => {
        sessionStorage.removeItem('status');
        reloadPage()
})

//Displaying todos (based on filtering values)
const todo_list = document.querySelector('#todo-list');
let append = '';
let count = 1;
if (sessionStorage.getItem('status') === null) {
    getTodos().forEach(todo => {
        append += `<span>${count++}. <li>${todo.text}<div class="todo-checkbox-delete"><input type="checkbox" class="status" name="status" ${todo.status ? 'checked' : ''}><i id="delete-todo" class="fa-solid fa-x"></i></div></li></span>`;
    })
}
else if (sessionStorage.getItem('status') === 'done') {
    getTodos().forEach(todo => {
        if (todo.status === true) {
            append += `<span>${count++}. <li>${todo.text}<div class="todo-checkbox-delete"><input type="checkbox" class="status" name="status" ${todo.status ? 'checked' : ''}><i id="delete-todo" class="fa-solid fa-x"></i></div></li></span>`;
        }
    })
}
else if (sessionStorage.getItem('status') === 'undone') {
    getTodos().forEach(todo => {
        if (todo.status === false) {
            append += `<span>${count++}. <li>${todo.text}<div class="todo-checkbox-delete"><input type="checkbox" class="status" name="status" ${todo.status ? 'checked' : ''}><i id="delete-todo" class="fa-solid fa-x"></i></div></li></span>`;
        }
    })
}

const todo_list_manipulation = document.querySelector('.todo-list-manipulation')
if (append !== '') {
    if (getTodos().length > 0) {
        todo_list_manipulation.style.display = 'flex';
    }
    todo_list.innerHTML = append;
}
else {
    if (getTodos().length === 0) {
        todo_list_manipulation.style.display = 'none'
        todo_list.innerHTML = `<p>There's not any to-do in the list.</p>`;
        todo_list.style.justifyContent = 'center'
        todo_list.style.paddingTop = '50px'
    }
    else if (getTodos().length !== 0) {
        todo_list.innerHTML = `<p>No to-dos have been found based on this filter.</p>`;
        todo_list.style.justifyContent = 'center'
        todo_list.style.paddingTop = '50px'
    }
}

// Storing the newly added todo
to_do_form.addEventListener('submit', e => {
    e.preventDefault();
    const target = e.target.elements;
    const todos = getTodos();
    if (validateTodo(target['to-do'].value)) {
        const todo = {
            text: target['to-do'].value.trim().replace(/\s\s+/g, ' '), // we are using trim and replace functions to remove the white spaces at the start and end of the string, and the spaces between the words which are more than 1 space in a row
            status: false
        }
        if (todos.length === 0) {
            localStorage.setItem('todos', JSON.stringify([todo]));
            reloadPage()
        }
        else {
            localStorage.setItem('todos', JSON.stringify([...todos, todo]));
            reloadPage()
        }
    }
    
});

// Storing todos whose status has been changed, in an array, so that when changes are confirmed to be saved, we'll just save those changes based on the data that we are storing in this array
const save_button = document.querySelector("#save-changes");
const revert_button = document.querySelector('#revert-changes');
let todos_statuses = document.querySelectorAll(".status");
let change_list = [];
todos_statuses.forEach(todo => {
    todo.addEventListener('change', e => {
        if (change_list.length === 0) {
            change_list.push({ text: todo.parentElement.parentElement.innerText, status: todo.checked ? true : false})
            save_button.removeAttribute('disabled')
            revert_button.removeAttribute('disabled')
            save_button.style.cursor = 'default';
            revert_button.style.cursor = 'default';
            save_button.style.opacity = '1';
            revert_button.style.opacity = '1';
        }
        else if (change_list.length !== 0) {
            const element = change_list.filter(element => element.text === todo.parentElement.parentElement.innerText);
            if (element.length !== 0) {
                change_list = change_list.filter(element => element.text !== todo.parentElement.parentElement.innerText)
            }
            else {
                change_list.push({ text: todo.parentElement.parentElement.innerText, status: todo.checked ? true : false})
                save_button.removeAttribute('disabled')
                revert_button.removeAttribute('disabled')
                save_button.style.cursor = 'default';
                revert_button.style.cursor = 'default';
                save_button.style.opacity = '1';
                revert_button.style.opacity = '1';
            }
        }
        if (change_list.length === 0) {
            save_button.setAttribute('disabled', '');
            revert_button.setAttribute('disabled', '');
            save_button.style.cursor = 'not-allowed';
            revert_button.style.cursor = 'not-allowed';
            save_button.style.opacity = '.4';
            revert_button.style.opacity = '.4';
        }
    })
})

// Save changes button clicked, so diplay confirmation pop-up
const todo_list_form = document.querySelector('#todo-list-form');
if (todo_list_form !== null) {
    todo_list_form.addEventListener('submit', e => {
        e.preventDefault();
        const pop_up_hide_background = document.querySelector('.pop-up-hide-background');
        pop_up_hide_background.style.display = 'block';
        const pop_up = document.querySelector('.save-changes-pop-up');
        pop_up.classList.remove('hide-popup');
        pop_up.style.animation = 'pop-up-expand .2s forwards';
    })
}

// Confirm saving changes
const confirm_button = document.querySelector('#confirm');
confirm_button.addEventListener('click', e => {
    if (change_list.length !== 0) {
        const todos = getTodos();
        if (todos.length !== null) {
            todos.forEach(todo => {
                change_list.forEach(element => {
                    if (element.text.trim() === todo.text) {
                        todo.status = element.status;
                    }
                })
            })
        }
        localStorage.setItem('todos', JSON.stringify([...todos]));
        reloadPage()
    }
})

// Reject saving changes
const reject_button = document.querySelector('#reject');
reject_button.addEventListener('click', e => {
    const pop_up_hide_background = document.querySelector('.pop-up-hide-background');
    pop_up_hide_background.style.display = 'none';
    const pop_up = document.querySelector('.save-changes-pop-up');
    setTimeout(() => {
        pop_up.classList.add('hide-popup');
    }, 100);
    pop_up.style.animation = 'pop-up-remove .2s forwards';
})

// Revert todo status changes
revert_button.addEventListener('click', e => {
    if (change_list.length !== 0) {
        reloadPage()
    }
})

// Delete a sigle todo
const delete_todo = document.querySelectorAll('#delete-todo');
if (delete_todo !== null) {
    delete_todo.forEach(d_todo => {
        d_todo.addEventListener('click', e => {
            let text = d_todo.parentElement.parentElement.innerText;
            const exclude = getTodos().filter(todo => todo.text !== text.trim()); // seems that safari takes up an extra space character, that's why we are trimming it
            localStorage.setItem('todos', JSON.stringify([...exclude]));
            reloadPage()
        })
    })
}

// Clear todos list button clicked, so display confirmation pop-up
const clear_list_button = document.querySelector('#clear-list');
if (clear_list_button !== null) {
    clear_list_button.addEventListener('click', e => {
        const pop_up_hide_background = document.querySelector('.pop-up-hide-background');
        pop_up_hide_background.style.display = 'block';
        const pop_up = document.querySelector('.clear-todos-pop-up');
        pop_up.classList.remove('hide-popup');
        pop_up.style.animation = 'pop-up-expand .2s forwards';
    })
}

// Confirm deleting todos list
const delete_todos_confirm_button = document.querySelector('#confirm-clear-todos');
delete_todos_confirm_button.addEventListener('click', e => {
    if (getTodos().length !== 0) {
        localStorage.removeItem('todos');
        reloadPage()
    }
})

// Reject deleting todos list
const delete_todos_reject_button = document.querySelector('#reject-clear-todos');
delete_todos_reject_button.addEventListener('click', e => {
    const pop_up_hide_background = document.querySelector('.pop-up-hide-background');
    pop_up_hide_background.style.display = 'none';
    const pop_up = document.querySelector('.clear-todos-pop-up');
    setTimeout(() => {
        pop_up.classList.add('hide-popup');
    }, 100);
    pop_up.style.animation = 'pop-up-remove .2s forwards';
})


// Staying at the same scrolling position as we were before reload
document.addEventListener("DOMContentLoaded", function (event) {
    var scrollpos = sessionStorage.getItem('scrollpos');
    if (scrollpos) {
        window.scrollTo(0, scrollpos);
        sessionStorage.removeItem('scrollpos');
    }
});

window.addEventListener("beforeunload", function (e) {
    sessionStorage.setItem('scrollpos', window.scrollY);
});
