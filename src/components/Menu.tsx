import { type Component, createSignal, For, Show } from 'solid-js';
import { licenses } from '../data/licenses';
import './Menu.css';

interface MenuProps {
  onClose: () => void;
}

type MenuSection = 'main' | 'licenses';

const Menu: Component<MenuProps> = (props) => {
  const [currentSection, setCurrentSection] = createSignal<MenuSection>('main');

  const handleNavigate = (section: MenuSection) => {
    setCurrentSection(section);
  };

  const handleBack = () => {
    setCurrentSection('main');
  };

  return (
    <div class="menu-overlay" onClick={props.onClose}>
      <div class="menu-container" onClick={(e) => e.stopPropagation()}>
        <Show when={currentSection() === 'main'}>
          <div class="menu-main">
            <div class="menu-header">
              <h2>メニュー</h2>
              <button class="close-btn" onClick={props.onClose}>
                ✕
              </button>
            </div>
            <nav class="menu-nav">
              <button class="menu-item" onClick={() => handleNavigate('licenses')}>
                <span class="menu-item-icon">📄</span>
                <span class="menu-item-label">権利表記</span>
                <span class="menu-item-arrow">›</span>
              </button>
            </nav>
          </div>
        </Show>

        <Show when={currentSection() === 'licenses'}>
          <div class="menu-section">
            <div class="menu-header">
              <button class="back-btn" onClick={handleBack}>
                ‹ 戻る
              </button>
              <h2>権利表記</h2>
              <button class="close-btn" onClick={props.onClose}>
                ✕
              </button>
            </div>
            <div class="menu-content">
              <p class="section-description">
                このアプリケーションで使用しているオープンソースソフトウェアのライセンス情報です。
              </p>
              <div class="licenses-list">
                <For each={licenses}>
                  {(license) => (
                    <div class="license-item">
                      <div class="license-header">
                        <h3>{license.name}</h3>
                        <span class="license-version">v{license.version}</span>
                      </div>
                      <div class="license-type">{license.licenseType}</div>
                      <Show when={license.url}>
                        <a
                          href={license.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="license-link"
                        >
                          {license.url}
                        </a>
                      </Show>
                      <pre class="license-text">{license.licenseText}</pre>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default Menu;
