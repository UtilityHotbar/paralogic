const DATA = {
    'recording': false,
    'transcript': '',
    'most_recent_block': '',
    'stm_id':0,
}

const EXAMPLE_TEXT = `'Jean-Jacques Rousseau was a Genevan philosopher, writer, and composer. His political philosophy influenced the progress of the Age of Enlightenment throughout Europe, as well as aspects of the French Revolution and the development of modern political, economic, and educational thought.

I am hungry, I want some food.

Many elements of Descartes's philosophy have precedents in late Aristotelianism, the revived Stoicism of the 16th century, or in earlier philosophers like Augustine. In his natural philosophy, he differed from the schools on two major points. First, he rejected the splitting of corporeal substance into matter and form; second, he rejected any appeal to final ends, divine or natural, in explaining natural phenomena. 

The white-space CSS property sets how white space inside an element is handled.

Tmp uses crypto for determining random file names, or, when using templates, a six letter random identifier. And just in case that you do not have that much entropy left on your system, Tmp will fall back to pseudo random numbers.

Love is an immensely powerful force. It can be very dangerous if it clouds your judgement.'`

const EXAMPLE_CATEG_SCRIPT = [
    { role: "system", content: "You are a helpful assistant. You will be given a text and asked to categorise individual sections from that text based on a list of topics.\n\nFor example, the sentence 'I visited the Eiffel Tower' would belong in the category 'Paris' instead of the category 'Dogs'.\n\nUse the context of the whole text to provide your answer. If you think the sentence belongs to none of the topics provided, answer 'none of the above', and I will ask you to provide an alternate label.\n\nFrom time to time you will be given a new text. This will be signalled by the use of the tag\"[NEW TEXT]\". In that case, respond with the word 'ready'.\n\n" },
    {role: "user", content: '[NEW TEXT]: '+EXAMPLE_TEXT},
    {role: "assistant", content: "ready"},
    {role: "user", content: "'The white-space CSS property sets how white space inside an element is handled.'\n\nCategories: ['personal information', 'coding', 'french philosophers']"},
    {role: "assistant", content: 'coding'},
    {role: "user", content: "'Many elements of Descartes's philosophy have precedents in late Aristotelianism, the revived Stoicism of the 16th century, or in earlier philosophers like Augustine.'\n\nCategories: ['personal information', 'coding', 'french philosophers']"},
    {role: "assistant", content: 'french philosophers'},
    {role: "user", content: "'I am hungry, I want some food.'\n\nCategories: ['personal information', 'coding', 'french philosophers']"},
    {role: "assistant", content: 'personal information'},
    {role: "user", content: "'Love is an immensely powerful force.'\n\nCategories: ['personal information', 'coding', 'french philosophers']"},
    {role: "assistant", content: 'none of the above'},
    {role: "user", content: "What category should it be?"},
    {role: "assistant", content: 'emotions'},
]

const EXAMPLE_EXPAND_SCRIPT = [
    { role: "system", content: "You are a helpful assistant. You will be given a text and asked to rewrite individual sentences from that text to remove ambiguity.\n\nUse the context of the whole text to provide your answer. Repond with the rewritten sentence ONLY. Do NOT add extra data to the sentence, or rewrite the word order. If the sentence is not ambiguous, repeat the sentence back.\n\nFrom time to time you will be given a new text. This will ALWAYS be signalled by the use of the tag\"[NEW TEXT]\". In that case, respond with the word 'ready'.\n\n" },
    {role: "user", content: '[NEW TEXT]: '+EXAMPLE_TEXT},
    {role: "assistant", content: "ready"},
    {role: "user", content: "In his natural philosophy, he differed from the schools on two major points."},
    {role: "assistant", content: 'In Descarte\'s natural philosophy, he differed from the Aristotelians and Stocists on two major points.'},
    {role: "user", content: "It can be very dangerous if it clouds your judgement."},
    {role: "assistant", content: 'Love can be very dangerous if it clouds your judgement.'},
    {role: "user", content: "Jean-Jacques Rousseau was a Genevan philosopher, writer, and composer."},
    {role: "assistant", content: 'Jean-Jacques Rousseau was a Genevan philosopher, writer, and composer.'}
]

const EXAMPLE_REWRITE_SCRIPT = [
    {role: "system", content: "You are a helpful assistant. Your job is to rewrite incoming passages to remove line breaks in the middle of a line, cut off words, and simple typos. Preserve bullet points and other punctuation where necessary.\n\nThe user will give you texts to rewrite. Respond with ONLY the rewritten text. NEVER include your comments or other information."}
]

const EXAMPLE_EXPAND_TOPIC_SCRIPT = [
    {role: "system", content: "You are a helpful assistant. You will be given a collection of sentences and asked to split them into two groups. Each group should have a detailed descriptive theme, like \'Problems in French Philosophy\' or \'Properties of Tropical Fruit\'. \n\nThe user will give you lists of sentences. Respond with ONLY the two themes separated by a comma. NEVER include your comments or other information."},
    {role: "user", content: "* A corollary of the above: the phrase “general intelligence” has no meaning to our current paradigm of machine intelligence.\n* Insofar as there is a universal ideal of intelligence for a given distribution of data, it will be via a process that detects patterns in data and in doing so can predict future data points.\n* If we place such a system in two different contexts, it will learn two different distributions, and predict two sets of data points.\n* It will, by definition, become two different forms of “intelligence”.\n* Furthermore, by itself such a system does not act or think or produce value.\n* It is the way such intelligence is instantiated, the forms and domains of agency it will act within, that give it meaning.\n* We may have “intelligence that can accomplish tasks with economic value to our present economy”, or “intelligence that can accomplish tasks with quality-of-life-enhancing value to humans”, or perhaps “intelligence incompatible with human values and therefore harmful”, but we will not have “general intelligence”. "},
    {role: "assistant", content: "The Concept of General Intelligence, The Process of Learning"}
]


function post_to_table(category, content){
    topoi_children = document.getElementById('paralogic-topoi').children
    d = null
    for (let c=0; c < topoi_children.length; c++){
        curr = topoi_children[c];
        if (curr.cells[0].innerHTML == category){
            d = curr
        }
    }
    if (d === null){
        row = document.createElement('tr')

        killCol = document.createElement('td')
        killButton = document.createElement('button')
        killButton.innerHTML = '❌'
        killButton.title = 'Remove this theme'
        killButton.onclick = (e)=>{
            g = e.target.parentElement.parentElement
            g.parentElement.removeChild(g)
        }
        
        killCol.appendChild(killButton)

        explodeCol = document.createElement('td')
        explodeButton = document.createElement('button')
        explodeButton.innerHTML = '💥'
        explodeButton.title = 'Split this theme'
        explodeButton.onclick = (e) => {
            g = e.target.parentElement.parentElement
            expand_statements(g)
        }

        explodeCol.appendChild(explodeButton)

        header = document.createElement('th')
        header.innerHTML = category
        header.classList.add('paralogic-topoi-th')
        header.contentEditable = true

        contentHolder = document.createElement('td')
        contentHolder.classList.add('paralogic-topoi-td')


        list_of_stms = document.createElement('ul')
        list_of_stms.classList.add('paralogic-topoi-ul')
        
        contentHolder.appendChild(list_of_stms)
        

        row.appendChild(header)
        row.appendChild(contentHolder)
        row.appendChild(killCol)
        row.appendChild(explodeCol)

        document.getElementById('paralogic-topoi').appendChild(row)
    }
    for (let c=0; c < topoi_children.length; c++){
        curr = topoi_children[c];
        if (curr.cells[0].innerHTML == category){
            d = curr
        }
    }
    console.log(d)
    if (content){
        d.cells[1].children[0].innerHTML += '<li>'+content+'</li>'

    }
}

function purge_short_statements(){
    var stm_list = document.getElementById('paralogic-statements')
    purge_list= []
    for (let c=0;c<stm_list.children.length; c++){
        var e = stm_list.children[c]
        if (e.innerHTML.replace('<br>','').length < 3){
            purge_list.push(e)
        }
    }
    purge_list.forEach((e)=>{
        e.parentElement.removeChild(e)
    })
}

async function create_completion(context){
    console.log('requesting openai completion')
    my_req = new Request('/get_chat_completion', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(context)
    })

    console.log(my_req, my_req.body)
    const answer = await fetch(my_req)
    console.log(answer)
    const j = await answer.text()
    console.log('answer sent back is', j)
    return j
}

function order_statements_by_time(){
    var mylist = document.getElementById('paralogic-statements');
    var divs = mylist.getElementsByTagName('li');
    var listitems = [];
    for (i = 0; i < divs.length; i++) {
            listitems.push(divs.item(i));
    }
    listitems.sort(function(a, b) {
        var compA = parseInt(a.getAttribute('id').split('-')[2]);
        var compB = parseInt(b.getAttribute('id').split('-')[2]);
        return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    });
    for (i = 0; i < listitems.length; i++) {
        mylist.appendChild(listitems[i]);
    }
}

async function create_statements(full=false){
    if (!full){
        if (DATA['most_recent_block'] == ''){
            DATA['most_recent_block'] = document.getElementById('paralogic-transcript').innerHTML
            document.getElementById('paralogic-statements').innerHTML = ''
        }
        text = DATA['most_recent_block']
        DATA['most_recent_block'] = ''
    }else{
        document.getElementById('paralogic-statements').innerHTML = ''
        DATA['transcript'] = document.getElementById('paralogic-transcript').innerHTML
        text = DATA['transcript']
        DATA['most_recent_block'] = ''
        document.getElementById('paralogic-topoi').innerHTML = ''

    }
    console.log('incoming', text)
    text = text.replace('<br>', '\n').replace('\n','\n\n');
    text = await create_completion(EXAMPLE_REWRITE_SCRIPT.concat([{role: "user", content: text}]))
    basic_stms = text.split("\n")
    trimmed_stms = []
    basic_stms.forEach(s => {
        g = s.trim()
        if (g.length>0){
            trimmed_stms = trimmed_stms.concat(g.split(". "))
        }
    });
    prompt_build = EXAMPLE_EXPAND_SCRIPT.concat([{role: "user", content: '[NEW TEXT]: '+DATA['transcript']},{role: "assistant", content: "ready"}])
    console.log('Raw statements: ', trimmed_stms)
    for (let t=0;t<trimmed_stms.length; t++){
        var item = trimmed_stms[t]
        // final_prompt = prompt_build.concat([{role: "user", content: item}])
        // create_completion(final_prompt).then((reformed)=>{
        //     document.getElementById('paralogic-statements').innerHTML += '<li contenteditable="true">'+reformed+'</li>'

        // })
        document.getElementById('paralogic-statements').innerHTML += '<li id="paralogic-stm-'+DATA['stm_id']+'" contenteditable="true">'+item.replace(/(<([^>]+)>)/gi, '')+'</li>'
        DATA['stm_id'] += 1
    }
}

function add_one_statement(){
    document.getElementById('paralogic-statements').innerHTML += '<li id="paralogic-stm-'+DATA['stm_id']+'" contenteditable="true">'+'New Statement'+'</li>'
    DATA['stm_id'] += 1
}

function clear_all_stms_in_table(){
    table = document.getElementById("paralogic-topoi")
    for (var i = 0, row; row = table.rows[i]; i++){
        row.cells[1].innerHTML = ''
        list_of_stms = document.createElement('ul')
        list_of_stms.classList.add('paralogic-topoi-ul')
        
        row.cells[1].appendChild(list_of_stms)

    }

}

async function expand_statements(parentRow){
    console.log(parentRow)
    orig_topic_name = parentRow.cells[0].innerHTML
    stms = []
    orig_stm_ul = parentRow.cells[1].children[0]
    for (let c=0;c<orig_stm_ul.children.length;c++){
        stms.push(orig_stm_ul.children[c].innerHTML)
    }
    new_string = '* '+(stms.join('\n* '))
    console.log('Expanding topic ', orig_topic_name, ' with stms ', new_string)
    base_new_topics = (await create_completion(EXAMPLE_EXPAND_TOPIC_SCRIPT.concat({'role': 'user', 'content': new_string}))).toLowerCase().split(',')
    trimmed_new_topics = []
    base_new_topics.forEach((t)=>{trimmed_new_topics.push(t.trim())})
    console.log('New topics: ', trimmed_new_topics)
    prompt_build = EXAMPLE_CATEG_SCRIPT.concat([{role: "user", content: '[NEW TEXT]: '+new_string},{role: "assistant", content: "ready"}])

    parentRow.parentElement.removeChild(parentRow)
    sort_statements_iter(trimmed_new_topics, stms, prompt_build)
}

async function sort_statements_iter(topoi, stms, prompt_build){
    for (let i=0; i < stms.length; i++){
        t = stms[i]
        final_prompt = prompt_build.concat([{role: "user", content: "'"+t+"'\n\nCategories: "+JSON.stringify(topoi)}])

        console.log(final_prompt)
        completion = await create_completion(final_prompt)
        console.log(completion)
        console.log('for stm '+t)
        categ_proposed = completion.toLowerCase();
        if (categ_proposed == 'none of the above'){
            new_completion = await create_completion(final_prompt.concat([{role: "assistant", content: "none of the above"},{role: "user", content: "What category should it be?"}]))
            new_categ = new_completion.toLowerCase()
            console.log('adding new category', new_categ)
            post_to_table(new_categ, t)
            topoi.push(new_categ)
        }else{
            post_to_table(categ_proposed, t)
        }
    }
}

async function sort_statements(){
    clear_all_stms_in_table()

    topics = ['personal data']
    var table = document.getElementById("paralogic-topoi");
    for (var i = 0, row; row = table.rows[i]; i++) {
        topics.push(row.cells[0].innerHTML)
    }
    console.log('Topics: ', topics)

    prompt_build = EXAMPLE_CATEG_SCRIPT.concat([{role: "user", content: '[NEW TEXT]: '+DATA['transcript']},{role: "assistant", content: "ready"}])
    var c = document.getElementById("paralogic-statements").children
    
    stms = []

    for (let i=0; i< c.length;i++){
        elem = c[i]
        console.log(elem)
        t = elem.innerHTML 
        if (t.length > 3){
            stms.push(t)
        }
    }

    console.log('Statements to work on', stms)

    sort_statements_iter(topics, stms, prompt_build)
}



window.onload = ()=>{

    if (navigator.mediaDevices) {
    console.log("getUserMedia supported.");

    const constraints = { audio: true };
    let chunks = [];

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);

        document.querySelector('#record').onclick = () => {
        if (!DATA['recording']){
                DATA['recording'] = true;
                mediaRecorder.start();
                console.log(mediaRecorder.state);
                console.log("recorder started");
                document.querySelector('#record').classList.add("recording");
        }else{
                DATA['recording'] = false;
                mediaRecorder.stop();
                console.log(mediaRecorder.state);
                console.log("recorder stopped");
                document.querySelector('#record').classList.remove("recording");
        }

        };

        mediaRecorder.onstop = (e) => {
            console.log("recorder stopped");

            const blob = new Blob(chunks, { type: "audio/ogg" });
            const audioURL = URL.createObjectURL(blob);
            console.log("audio data created");


            // cleanup and post
            chunks = [];
            var my_body = new FormData();
            my_body.append('file', blob, "useraudio.ogg")
            speech_to_text = new Request("/get_transcription", {
                method: "POST",
                body: my_body
            })
            console.log(speech_to_text)

            fetch(speech_to_text).then((response) => {console.log(response);return response.json()}).then((data) =>{
                d = data.text; 
                var visible_transcript = document.getElementById('paralogic-transcript')

                if (DATA['transcript'].length == 0){
                    visible_transcript.innerHTML = d;
                }else{
                    visible_transcript.innerHTML += '\n\n'+d;

                }
                if (DATA['transcript'].length == 0){
                    DATA['transcript'] = d.trim()
                }else{
                    DATA['transcript'] += '\n\n'+d.trim()

                }
                if (DATA['most_recent_block'].length == 0){
                    DATA['most_recent_block'] = d.trim()
                }else{
                    DATA['most_recent_block'] += '\n\n'+d.trim()
                }
                

            })


        };

        mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
        };
        })
        .catch((err) => {
        console.error(`The following error occurred: ${err}`);
        });
    }else{
        alert('No microphone detected, or user media has been disabled.')
    }
}