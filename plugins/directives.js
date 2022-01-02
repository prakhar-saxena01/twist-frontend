import Vue from 'vue';

const tagsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
}

const regexWww = /(^|&lt;|\s)(www\..+?\..+?)(\s|&gt;|$)/gi;
const regexSource = /(^|&lt;|\s)(((https?|ftp):\/\/).+?)(\s|&gt;|$)/gi;
const regexMail = /(^|&lt;|\s)(\w*\@\w*\.\w*)(\s|&gt;|$)/gi;
const regexSkype = /(^|&lt;|\s)(skype\:.+?)(\s|&gt;|$)/gi;

const replaceTag = tag => tagsToReplace[tag] || tag;

const safeTagsReplace = str => str.replace(/[&<>]/g, replaceTag);

const autoLink = string => safeTagsReplace(string)
  .replace(regexWww, '$1<a href="http://$2" rel="noopener" target="_blank">$2</a>$3')
  .replace(regexSource, '$1<a href="$2" rel="noopener" target="_blank">$2</a>$5')
  .replace(regexMail, '$1<a href="mailto:$2" rel="noopener" target="_blank">$2</a>$3')
  .replace(regexSkype, '$1<a href="skype:$2" rel="noopener" target="_blank">$2</a>$3');

export default () => {
  // See more: https://github.com/vuejs/vue/issues/5089
  if (!Vue.__hasAutoLinkDirective__) {
    Vue.__hasAutoLinkDirective__ = true
    Vue.directive('autolink', (el, binding) => {
      el.innerHTML = autoLink(binding.value);
    });
  }

  if (!Vue.__hasRoundMixin__) {
    Vue.__hasRoundMixin__ = true
    Vue.mixin({
      methods: {
        round(value, decimals, noPadding) {
          let result = String(Number(Math.round(parseFloat(value) + 'e' + decimals) + 'e-' + decimals));

          const dotSplit = result.split('.');
          const resultDecimals = dotSplit.length === 2
            ? dotSplit[1].length
            : 0;

          if (!noPadding) {
            if (dotSplit.length !== 2) {
              result += '.';
            }

            for (let i = 0; i < decimals - resultDecimals; i++) {
              result += '0';
            }
          }

          return result;
        },
      },
    })
  }
}
