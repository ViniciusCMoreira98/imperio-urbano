package br.imperiourbano.web;

import java.time.Duration;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Site do jogo publicado junto com a API (build do Vite em {@code classpath:/static}, copiado no Dockerfile).
 * {@code /assets} tem o conteúdo no nome do arquivo: cache de um ano. Modelos, áudio e o index.html mudam
 * sem trocar de nome: o navegador revalida a cada visita (resposta 304 quando nada mudou).
 */
@Configuration
class StaticSiteConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable());
        // O trecho casado por ** é procurado dentro da pasta indicada: uma pasta por prefixo.
        for (String folder : new String[] {"models", "audio"}) {
            registry.addResourceHandler("/" + folder + "/**")
                    .addResourceLocations("classpath:/static/" + folder + "/")
                    .setCacheControl(CacheControl.noCache());
        }
        registry.addResourceHandler("/index.html", "/*.*")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.noCache());
    }
}
