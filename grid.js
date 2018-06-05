const svg_path_start = 'm-0.5,1080.5l-2421.0568,852.37141s2421.5568,-1932.87141 2445.75108,-878.45198c469.64406,46.90692 561.66275,-255.62705 1075.17573,-224.37127c513.51298,31.25578 134.30935,266.50318 902.05917,204.43143l-80.92918,46.02041l-1921,0z'
const svg_path_wave = 'm-0.5,1080.5l-864.68917,689.4304s865.18917,-1769.9304 1284.68917,-1471.99185c146.18046,452.82203 164.45115,-29.45473 681.13535,68.3965c516.68419,97.85123 207.49626,439.90354 953.0476,-75.65151l-133.18295,789.81646l-1921,0z'
const svg_path_end = 'm-0.5,1080.5l-1010.77422,-1074.82749s1011.27422,-5.67251 1445.63037,-35.65363c469.64406,46.90692 216.46659,-18.94118 729.97957,12.3146c513.51298,31.25578 7.53843,1.72403 775.28825,-60.34772l-19.12397,1158.51424l-1921,0z'

document.addEventListener("DOMContentLoaded", function() {
  let lastElementClicked;
  Barba.Pjax.init();
  Barba.Prefetch.init();

  Barba.Dispatcher.on('linkClicked', function(el) {
    lastElementClicked = el;
  });

  const ExpandTransition = Barba.BaseTransition.extend({
    start: function() {
      this.originalThumb = lastElementClicked;

      Promise
      .all([this.newContainerLoading, this.enlargeThumb()])
      .then(this.showNewPage.bind(this));
    },

    enlargeThumb: function() {
      const deferred = Barba.Utils.deferred();
      const thumbPosition = this.originalThumb.getBoundingClientRect();

      this.cloneThumb = this.originalThumb.cloneNode(true);
      this.cloneThumb.style.position = 'absolute';
      this.cloneThumb.style.top = thumbPosition.top + 'px';

      this.oldContainer.appendChild(this.cloneThumb);

      this.oldContainer.querySelector('#start').setAttribute('d', svg_path_start)
      this.oldContainer.querySelector('.animation').classList.remove('none')
      this.oldContainer.querySelector('#start').style.display='inline'
      TweenLite.to(this.oldContainer.querySelector('#start'), 1, {morphSVG:svg_path_wave})
      TweenLite.to(this.oldContainer.querySelector('#start'), 1, {morphSVG:svg_path_end}).delay(0.6)
      TweenLite.to(this.cloneThumb, 1, { top: 0, height: window.innerHeight }).delay(1.8)
      TweenLite.to(this.oldContainer.querySelector('#start'), 1, {morphSVG:svg_path_wave}).delay(2)
      TweenLite.to(this.oldContainer.querySelector('#start'), 1, {morphSVG:svg_path_start}).delay(2.6)

      setTimeout(function () {
        document.querySelector('.animation').classList.add('none')
        deferred.resolve()
      }, 3600)

      return deferred.promise;
    },

    showNewPage: function() {
      this.newContainer.style.visibility = 'visible';
      this.done();
    }
  });


  const ShrinkTransition = Barba.BaseTransition.extend({
    start: function() {
      this.newContainerLoading.then(this.shrinkImage.bind(this));
    },

    shrinkImage: function() {
      const _this = this;

      this.oldContainer.style.zIndex = '10';
      this.newContainer.style.visibility = 'visible';

      const href = Barba.HistoryManager.prevStatus().url.split('/').pop();
      const destThumb = this.newContainer.querySelector('a[href="' + href + '"]');
      const destThumbPosition = destThumb.getBoundingClientRect();
      const fullImage = this.oldContainer.querySelector('.full');

      TweenLite.to(this.oldContainer.querySelector('.back'), 0.2, { opacity: 0 });
      this.oldContainer.querySelector('#start').setAttribute('d', svg_path_start)
      this.oldContainer.querySelector('.animation').classList.remove('none')
      this.oldContainer.querySelector('#start').style.display='inline'
      TweenLite.to(this.oldContainer.querySelector('#start'), 1, {morphSVG:svg_path_wave})
      TweenLite.to(this.oldContainer.querySelector('#start'), 1, {morphSVG:svg_path_end}).delay(0.6)
      setTimeout( () => {
        fullImage.style.top = `${destThumbPosition.top}px`,
        fullImage.style.height = `${destThumb.clientHeight}px`
      }, 1800)
      TweenLite.to(this.oldContainer.querySelector('#start'), 1, {morphSVG:svg_path_wave}).delay(2)
      TweenLite.to(this.oldContainer.querySelector('#start'), 1, {morphSVG:svg_path_start}).delay(2.6)
      setTimeout(function () {
        _this.done()
      }, 3600)
    }
  });

  Barba.Pjax.getTransition = () => {
    return (Barba.HistoryManager.prevStatus().namespace === 'detail') ? ShrinkTransition : ExpandTransition ;
  };

});
