document.addEventListener('DOMContentLoaded', () => {
    fetch('聖杯戦争TRPGルール完全版.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            buildPage(data);
        })
        .catch(error => {
            console.error('Error fetching the JSON file:', error);
            const content = document.getElementById('content');
            content.innerHTML = `<h1>エラー</h1><p>ルールの読み込みに失敗しました。</p><p>ファイル名が「聖杯戦争TRPGルール完全版.json」になっているか、ファイルが同じ階層にあるか確認してください。</p>`;
        });
});

function buildPage(data) {
    document.title = data.title || '聖杯戦争TRPGルールブック';
    document.getElementById('main-title').textContent = data.title;
    document.getElementById('publication-date').textContent = `最終更新: ${data.publication_date}`;

    const toc = document.getElementById('toc');
    const ruleContent = document.getElementById('rule-content');

    const tocSection = data.sections.find(section => section.type === '目次');
    if (tocSection && tocSection.items) {
        tocSection.items.forEach(item => {
            const li = document.createElement('li');
            const anchorId = `section-${item.タイトル.replace(/[/・\s]/g, '_')}`;
            li.innerHTML = `<a href="#${anchorId}">${item.番号}. ${item.タイトル}</a>`;
            toc.appendChild(li);
        });
    }

    data.sections.forEach(section => {
        if (section.type === '目次') return;

        const sectionEl = document.createElement('section');
        const anchorId = `section-${section.type.replace(/[/・\s]/g, '_')}`;
        sectionEl.id = anchorId;
        
        const title = document.createElement('h2');
        title.textContent = section.type;
        sectionEl.appendChild(title);
        
        sectionEl.innerHTML += renderSectionContent(section);
        ruleContent.appendChild(sectionEl);
    });
}

function renderSectionContent(section) {
    let html = '';

    const addParagraph = (text) => {
        if (text) html += `<p>${text.replace(/\n/g, '<br>')}</p>`;
    };
    
    addParagraph(section.introduction);
    addParagraph(section.description);
    
    if (section.content && Array.isArray(section.content)) {
        html += `<ul>${section.content.map(c => `<li>${c}</li>`).join('')}</ul>`;
    }
    
    if (section.items && Array.isArray(section.items)) {
         html += `<ul>${section.items.map(item => `<li><b>${item.タイトル || item.番号}:</b> ${item.内容}</li>`).join('')}</ul>`;
    }

    if (section.subsections) {
        section.subsections.forEach(sub => {
            html += `<h3>${sub.title}</h3>`;
            addParagraph(sub.description);

            if (sub.terms) {
                html += '<div class="term-description"><dl>';
                sub.terms.forEach(term => {
                    html += `<dt>${term.term}</dt>`;
                    html += `<dd><ul>${Array.isArray(term.description) ? term.description.map(d => `<li>${d}</li>`).join('') : `<li>${term.description}</li>`}</ul></dd>`;
                });
                html += '</dl></div>';
            }
             if (sub.notations) {
                html += createTable(['記号', '用途', '例'], sub.notations, row => [`<span class="symbol">${row.symbol}</span>`, row.usage, row.example]);
            }
            if(sub.steps) {
                html += '<ol>';
                sub.steps.forEach(step => {
                    html += `<li><b>${step.title}:</b> ${step.details}</li>`;
                });
                html += '</ol>';
            }
            if (sub.phases) {
                 html += `<ol>${sub.phases.map(p => `<li>${p}</li>`).join('')}</ol>`;
                 if(sub.flow_summary) addParagraph(sub.flow_summary);
            }
            if (sub.phase_flow) {
                 sub.phase_flow.forEach(pf => {
                    html += `<h4>${pf.name}</h4>`;
                    if(pf.steps) html += `<ol>${pf.steps.map(s => `<li>${typeof s === 'object' ? `<b>${s.action || ''}</b> ${s.details || ''}` : s}</li>`).join('')}</ol>`;
                 });
            }
            if (sub.rules) {
                html += `<ul>${sub.rules.map(r => `<li>${r}</li>`).join('')}</ul>`;
            }
            if (sub.optional_rules) {
                sub.optional_rules.forEach(rule => {
                    html += `<h4>${rule.name}</h4><p>${rule.description}</p>`;
                });
            }
        });
    }
    
    if (section.sections) {
        section.sections.forEach(s => {
            html += `<h3>${s.title}</h3>`;
            addParagraph(s.description);
            
            if (s.points_table) {
                html += createTable(['リソース名', 'マスター', 'サーヴァント'], s.points_table, row => [row.リソース名, row.マスター, row.サーヴァント]);
            }
            if (s.status_table) {
                 html += createTable(['名称', '概要', '使用例'], s.status_table, row => [row.名称, row.概要, row.使用例]);
            }
             if (s.rank_table) {
                 html += createTable(['ランク', '実数値', '必要英雄点', 'RP目安'], s.rank_table, row => [row.ランク, row.実数値, row.必要英雄点, row.RP目安]);
            }
            if (s.required_attributes) {
                html += '<h4>必須属性</h4>';
                html += `<ul>${s.required_attributes.map(attr => `<li><b>${attr.属性}:</b> ${attr.概要}</li>`).join('')}</ul>`;
            }
            if (s.enhancement_attributes_intro) addParagraph(s.enhancement_attributes_intro);
            if (s.enhancement_attributes) {
                html += createTable(['属性名', '追加英雄点', '概要'], s.enhancement_attributes, row => [row.属性名, row.追加英雄点, row.概要]);
            }
            if (s.enhancement_attributes_notes) addParagraph(`<small>${s.enhancement_attributes_notes}</small>`);
            
            if (s.sections) {
                s.sections.forEach(ss => {
                    html += `<h4>${ss.title}</h4>`;
                    addParagraph(ss.description);
                    if (ss.style_table) {
                        html += createTable(['戦型名', 'キャラクター', 'HP計算式', 'FP計算式'], ss.style_table, row => [row.戦型名, row.キャラクター, `<code>${row.HP計算式}</code>`, `<code>${row.FP計算式}</code>`]);
                    }
                    if (ss.general_actions) {
                        html += createTable(['アクション', 'コスト', '効果'], ss.general_actions, row => [row.action, row.cost, row.effect.replace(/\n/g, '<br>')]);
                    }
                });
            }
            if(s.class_summary_table) {
                html += createTable(['クラス', '特性', '追加英雄点', '必須クラススキル', '実質初期英雄点'], s.class_summary_table, row => [row.クラス, row.特性, row.追加英雄点, row.必須クラススキル, row.実質初期英雄点]);
            }
            if(s.traits) {
                 html += createTable(['特性', '効果'], s.traits, row => [row.特性, row.効果]);
            }
        });
    }

    if (section.qa) {
        html += '<dl>';
        section.qa.forEach(item => {
            html += `<dt>Q: ${item.q}</dt><dd>A: ${item.a}</dd>`;
        });
        html += '</dl>';
    }
    
    return html;
}

function createTable(headers, data, rowMapper) {
    let table = '<table>';
    table += `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
    table += '<tbody>';
    data.forEach(item => {
        table += `<tr>${rowMapper(item).map(cell => `<td>${cell}</td>`).join('')}</tr>`;
    });
    table += '</tbody></table>';
    return table;
}