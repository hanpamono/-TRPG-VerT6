document.addEventListener('DOMContentLoaded', () => {
    // 'rules.json'ファイルを非同期で読み込む
    fetch('rules.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('rules.jsonの読み込みに失敗しました。');
            }
            return response.json();
        })
        .then(jsonData => {
            // JSONデータの読み込みが成功したら、ページを初期化する
            initializeApp(jsonData);
        })
        .catch(error => {
            console.error('エラー:', error);
            document.getElementById('content').innerHTML = `
                <h1>エラー</h1>
                <p>ルールファイル(rules.json)の読み込みに失敗しました。</p>
                <p>詳細: ${error.message}</p>
                <p>【重要】このツールをローカル環境でテストする場合、ウェブサーバーが必要です。詳細はドキュメントをご確認ください。</p>
            `;
        });
});

function initializeApp(jsonData) {
    const nav = document.querySelector('#navigation ul');
    const content = document.getElementById('content');
    const mainTitle = document.getElementById('main-title');

    mainTitle.textContent = jsonData.title;

    // ナビゲーションを生成
    jsonData.sections.forEach((section, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = section.type;
        a.href = `#${index}`;
        a.dataset.index = index;
        li.appendChild(a);
        nav.appendChild(li);
    });

    const navLinks = nav.querySelectorAll('a');

    // ページコンテンツを描画する関数
    const renderContent = (index) => {
        content.innerHTML = ''; // コンテンツをクリア
        const section = jsonData.sections[index];

        // アクティブなリンクのスタイルを更新
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.index == index) {
                link.classList.add('active');
            }
        });

        const title = document.createElement('h1');
        title.textContent = section.type;
        content.appendChild(title);

        if (section.content) {
            section.content.forEach(pText => {
                const p = document.createElement('p');
                p.innerHTML = pText.replace(/\n/g, '<br>');
                content.appendChild(p);
            });
        }
        
        if (section.introduction) {
            const intro = document.createElement('p');
            intro.textContent = section.introduction;
            content.appendChild(intro);
        }

        if (section.items) {
             content.appendChild(createTable(section.items));
        }
        
        if (section.extensions) {
            const p = document.createElement('p');
            p.textContent = section.extensions;
            content.appendChild(p);
        }

        if (section.subsections) {
            section.subsections.forEach(sub => {
                const subTitle = document.createElement('h2');
                subTitle.textContent = sub.title;
                content.appendChild(subTitle);
                
                if(sub.description) {
                    const desc = document.createElement('p');
                    desc.innerHTML = sub.description.replace(/\n/g, '<br>');
                    content.appendChild(desc);
                }

                if (sub.terms) {
                    sub.terms.forEach(term => {
                        const termBlock = document.createElement('div');
                        termBlock.className = 'term-block';
                        
                        const termTitle = document.createElement('p');
                        termTitle.className = 'term-title';
                        termTitle.textContent = `■ ${term.term}`;
                        termBlock.appendChild(termTitle);

                        if(Array.isArray(term.description)){
                            term.description.forEach(descText => {
                                const desc = document.createElement('p');
                                desc.innerHTML = descText.replace(/\n/g, '<br>');
                                termBlock.appendChild(desc);
                            });
                        }

                        if(term.activation) {
                            const p = document.createElement('p');
                            p.innerHTML = `<strong>発動:</strong> ${term.activation}`;
                            termBlock.appendChild(p);
                        }
                        if(term.effects) {
                            const ul = document.createElement('ul');
                            term.effects.forEach(effect => {
                                const li = document.createElement('li');
                                li.innerHTML = effect.replace(/\n/g, '<br>');
                                ul.appendChild(li);
                            });
                            termBlock.appendChild(ul);
                        }

                        content.appendChild(termBlock);
                    });
                }
                
                if (sub.notations) content.appendChild(createTable(sub.notations));
                if (sub.steps) content.appendChild(createList(sub.steps.map(s => `<strong>${s.step}. ${s.title}:</strong> ${s.details.join(' ')}`)));
                if (sub.phases) content.appendChild(createList(sub.phases));
                if (sub.flow_summary) content.appendChild(document.createElement('p')).textContent = sub.flow_summary;

                if (sub.phase_flow) {
                    sub.phase_flow.forEach(phase => {
                        const phaseTitle = document.createElement('h3');
                        phaseTitle.textContent = phase.name;
                        content.appendChild(phaseTitle);
                        content.appendChild(createList(phase.steps));
                    });
                }
                
                if (sub.rules) content.appendChild(createList(sub.rules));
                if (sub.optional_rules) {
                     sub.optional_rules.forEach(rule => {
                        const p = document.createElement('p');
                        p.innerHTML = `<strong>${rule.name}:</strong> ${rule.description}`;
                        content.appendChild(p);
                    });
                }
            });
        }
        
        if (section.sections) {
             section.sections.forEach(s => {
                const subTitle = document.createElement('h2');
                subTitle.textContent = s.title;
                content.appendChild(subTitle);

                if (s.description) {
                    const desc = document.createElement('p');
                    desc.innerHTML = s.description.replace(/\n/g, '<br>');
                    content.appendChild(desc);
                }

                // Table rendering logic
                ['points_table', 'status_table', 'rank_table', 'style_table', 'class_tables', 'class_summary_table', 'traits'].forEach(key => {
                    if (s[key]) content.appendChild(createTable(s[key]));
                });
                
                if(s.required_attributes) {
                     s.required_attributes.forEach(attr => {
                        const p = document.createElement('p');
                        p.innerHTML = `<strong>${attr.属性}:</strong> ${attr.概要.replace(/\n/g, '<br>')}`;
                        content.appendChild(p);
                    });
                }
                 if(s.enhancement_attributes_intro){
                    const intro = document.createElement('p');
                    intro.textContent = s.enhancement_attributes_intro;
                    content.appendChild(intro);
                }
                if(s.enhancement_attributes) content.appendChild(createTable(s.enhancement_attributes));
                if(s.enhancement_attributes_notes){
                    const notes = document.createElement('p');
                    notes.innerHTML = s.enhancement_attributes_notes.replace(/\n/g, '<br>');
                    content.appendChild(notes);
                }
                
                if(s.abilities) content.appendChild(createList(s.abilities));
                if(s.effects) content.appendChild(createList(s.effects));

                if (s.sections) { // Nested sections like in キャラクリエイト・共通編
                    s.sections.forEach(nestedS => {
                        const nestedTitle = document.createElement('h3');
                        nestedTitle.textContent = nestedS.title;
                        content.appendChild(nestedTitle);
                        if (nestedS.description) {
                             const desc = document.createElement('p');
                             desc.innerHTML = nestedS.description.replace(/\n/g, '<br>');
                             content.appendChild(desc);
                        }
                        if(nestedS.style_table) content.appendChild(createTable(nestedS.style_table));
                        if(nestedS.general_actions) {
                             content.appendChild(document.createElement('h4')).textContent = '汎用アクション一覧';
                             content.appendChild(createTable(nestedS.general_actions));
                        }
                    });
                }
                
                if (s.steps) { //戦闘処理
                    s.steps.forEach(step => {
                        const phaseTitle = document.createElement('h3');
                        phaseTitle.textContent = step.phase;
                        content.appendChild(phaseTitle);
                        if (step.actions) content.appendChild(createList(step.actions));
                        if (step.description) content.appendChild(document.createElement('p')).textContent = step.description;
                    });
                }
                if (s.actions_by_position) {
                    s.actions_by_position.forEach(pos => {
                        const p = document.createElement('p');
                        p.innerHTML = `<strong>${pos.position}:</strong> ${pos.actions.join(', ')}`;
                        content.appendChild(p);
                    });
                }
                
                if(s.methods) {
                    s.methods.forEach(method => {
                        const p = document.createElement('p');
                        p.innerHTML = `<strong>${method.name}:</strong> ${method.details}`;
                        content.appendChild(p);
                    });
                }
             });
        }
        
        if (section.skills) {
            Object.entries(section.skills).forEach(([skillType, skills]) => {
                const h2 = document.createElement('h2');
                if (skillType === 'class_skills') h2.textContent = 'クラススキル';
                else if (skillType === 'inherent_skills') h2.textContent = '固有スキル';
                else if (skillType === 'master_skills') h2.textContent = 'マスタースキル';
                content.appendChild(h2);
                
                if(Array.isArray(skills)){ // class_skills
                    skills.forEach(skill => renderSkill(skill, content));
                } else { // inherent_skills, master_skills
                    Object.entries(skills).forEach(([category, skillList]) => {
                         const h3 = document.createElement('h3');
                         h3.textContent = category;
                         content.appendChild(h3);
                         skillList.forEach(skill => renderSkill(skill, content));
                    });
                }
            });
        }
        
        if (section.noble_phantasms) {
            const { categories, special_actions } = section.noble_phantasms;
            
            const h2_cat = document.createElement('h2');
            h2_cat.textContent = "宝具カテゴリ";
            content.appendChild(h2_cat);
            
            categories.forEach(cat => {
                const h3 = document.createElement('h3');
                h3.textContent = cat.name;
                content.appendChild(h3);

                if (cat.overview) {
                    const p = document.createElement('p');
                    p.innerHTML = `<strong>概要:</strong> ${cat.overview}`;
                    content.appendChild(p);
                }

                if (cat.details) {
                    const block = document.createElement('blockquote');
                    // ★ 修正点 1 ★
                    // detailsが文字列なので、そのまま改行を<br>に変換
                    block.innerHTML = cat.details.replace(/\n/g, '<br>');
                    content.appendChild(block);
                }

                if (cat.types) {
                    cat.types.forEach(type => {
                        const modelTitle = document.createElement('h4');
                        modelTitle.textContent = `モデル: ${type.model}`;
                        content.appendChild(modelTitle);
                        const block = document.createElement('blockquote');
                        // ★ 修正点 2 ★
                        // type.detailsが文字列なので、そのまま改行を<br>に変換
                        block.innerHTML = type.details.replace(/\n/g, '<br>');
                        content.appendChild(block);
                    });
                }
            });
            
            const h2_sp = document.createElement('h2');
            h2_sp.textContent = "特殊アクション";
            content.appendChild(h2_sp);
            
            special_actions.forEach(action => {
                const h3 = document.createElement('h3');
                h3.textContent = action.name;
                content.appendChild(h3);
                if (action.description) content.appendChild(document.createElement('p')).innerHTML = action.description.replace(/\n/g, '<br>');
                if (action.conditions) content.appendChild(createList(action.conditions.map(c => c.replace(/\n/g, '<br>'))));
                if (action.effects_by_category) {
                     action.effects_by_category.forEach(eff => {
                        const p = document.createElement('p');
                        p.innerHTML = `<strong>${eff.category}:</strong> ${eff.effect}`;
                        content.appendChild(p);
                    });
                }
            });
        }
        
        if(section.qa) {
            section.qa.forEach(item => {
                const q = document.createElement('h3');
                q.textContent = `Q: ${item.q}`;
                content.appendChild(q);
                const a = document.createElement('p');
                a.innerHTML = `<strong>A:</strong> ${item.a}`;
                content.appendChild(a);
            });
        }
    };

    // ナビゲーションクリック時のイベント
    nav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const index = e.target.dataset.index;
            renderContent(index);
            window.history.pushState(null, '', e.target.href);
        }
    });

    // 初期表示
    renderContent(0);
}

// 汎用テーブル作成関数 (変更なし)
function createTable(data) {
    if (!data || data.length === 0) return document.createElement('div');
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headerRow = document.createElement('tr');

    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    data.forEach(rowData => {
        const row = document.createElement('tr');
        Object.values(rowData).forEach(value => {
            const td = document.createElement('td');
            if (typeof value === 'string') {
                td.innerHTML = value.replace(/\n/g, '<br>');
            } else {
                td.textContent = value;
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
}

// 汎用リスト作成関数 (変更なし)
function createList(items) {
    const ul = document.createElement('ul');
    items.forEach(itemText => {
        const li = document.createElement('li');
        li.innerHTML = itemText.replace(/\n/g, '<br>');
        ul.appendChild(li);
    });
    return ul;
}

// スキル表示用の関数 (変更なし)
function renderSkill(skill, container) {
    const block = document.createElement('div');
    block.className = 'term-block';
    
    const title = document.createElement('h4');
    title.textContent = skill.name;
    block.appendChild(title);

    if (skill.aptitude) {
        const p = document.createElement('p');
        let aptText = '';
        Object.entries(skill.aptitude).forEach(([key, val]) => {
            aptText += `<strong>${key}:</strong> ${val.join(', ')} `;
        });
        p.innerHTML = aptText;
        block.appendChild(p);
    }
    if (skill.cost) {
        const p = document.createElement('p');
        let costText = '<strong>コスト:</strong> ';
        Object.entries(skill.cost).forEach(([key, val]) => {
            costText += `${key}: ${val}点 `;
        });
        p.innerHTML = costText;
        block.appendChild(p);
    }
    
    const detailsBlock = document.createElement('blockquote');
    detailsBlock.innerHTML = skill.details.replace(/\n/g, '<br>');
    block.appendChild(detailsBlock);

    container.appendChild(block);
}