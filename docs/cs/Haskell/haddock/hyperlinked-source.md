# Haddock 如何生成 Hyperlinked source

Haddock 是 Haskell 的文档生成器。本文探究它如何生成 “带有超链接的源代码”。

## Hyperlinked source

带有超链接的源代码（Hyperlinked source）是 haddock 生成的 html 文件。在这个文件里，每个标识符都和它的定义绑定。

例如 [unfoldr 的 hyperlinked source](https://hackage.haskell.org/package/ghc-internal-9.1201.0/docs/src/GHC.Internal.Data.OldList.html#)，

```haskell
{-# INLINE unfoldr #-} -- See Note [INLINE unfoldr]
unfoldr f b0 = build (\c n ->
  let go b = case f b of
               Just (a, new_b) -> a `c` go new_b
               Nothing         -> n
  in go b0)
```

在 hyperlinked source 的网页模式，点击 build 就可以跳到 [build 的定义](https://hackage.haskell.org/package/ghc-internal-9.1201.0/docs/src/GHC.Internal.Base.html#build)。

鉴于 haskell-language-server 经常由于各种各样的原因不能启动，阅读 hyperlinked source 居然成了最好的读 haskell 源代码的方式。

## 使用 haddock 生成 hyperlinked source

```
stack haddock
```

## Hyperlinked source 的生成过程

目前 haddock 的源代码在 [ghc 仓库](https://gitlab.haskell.org/ghc/ghc/-/tree/master/utils/haddock)。

最相关的文件应该是 [Haddock.Backends.Hyperlinker](https://gitlab.haskell.org/ghc/ghc/-/blob/master/utils/haddock/haddock-api/src/Haddock/Backends/Hyperlinker.hs)，

其中，`ppHyperlinkedSource` 和 `ppHyperlinkedModuleSource` 应该是主要的函数

```haskell
-- | Generate hyperlinked source for given interfaces.
--
-- Note that list of interfaces should also contain interfaces normally hidden
-- when generating documentation. Otherwise this could lead to dead links in
-- produced source.
ppHyperlinkedSource
  :: Verbosity
  -> Bool
  -- ^ In one-shot mode
  -> FilePath
  -- ^ Output directory
  -> FilePath
  -- ^ Resource directory
  -> Maybe FilePath
  -- ^ Custom CSS file path
  -> Bool
  -- ^ Flag indicating whether to pretty-print HTML
  -> M.Map Module SrcPath
  -- ^ Paths to sources
  -> [Interface]
  -- ^ Interfaces for which we create source
  -> IO ()
ppHyperlinkedSource verbosity isOneShot outdir libdir mstyle pretty srcs' ifaces = do
  createDirectoryIfMissing True srcdir
  unless isOneShot $ do
    let cssFile = fromMaybe (defaultCssFile libdir) mstyle
    copyFile cssFile $ srcdir </> srcCssFile
    copyFile (libdir </> "html" </> highlightScript) $
      srcdir </> highlightScript
  mapM_ (ppHyperlinkedModuleSource verbosity srcdir pretty srcs) ifaces
  where
    srcdir = outdir </> hypSrcDir
    srcs = (srcs', M.mapKeys moduleName srcs')

-- | Generate hyperlinked source for particular interface.
ppHyperlinkedModuleSource
  :: Verbosity
  -> FilePath
  -> Bool
  -> SrcMaps
  -> Interface
  -> IO ()
ppHyperlinkedModuleSource verbosity srcdir pretty srcs iface = do
  -- Parse the GHC-produced HIE file
  nc <- freshNameCache
  HieFile
    { hie_hs_file = file
    , hie_asts = HieASTs asts
    , hie_types = types
    , hie_hs_src = rawSrc
    } <-
    hie_file_result
      <$> (readHieFile nc iface.ifaceHieFile)

  -- Get the AST and tokens corresponding to the source file we want
  let fileFs = mkFastString file
      mast
        | M.size asts == 1 = snd <$> M.lookupMin asts
        | otherwise = M.lookup (HiePath (mkFastString file)) asts
      tokens' = parse parserOpts sDocContext file rawSrc
      ast = fromMaybe (emptyHieAst fileFs) mast
      fullAst = recoverFullIfaceTypes sDocContext types ast

  -- Warn if we didn't find an AST, but there were still ASTs
  if M.null asts
    then pure ()
    else
      out verbosity verbose $
        unwords
          [ "couldn't find ast for"
          , file
          , show (M.keys asts)
          ]

  -- The C preprocessor can double the backslashes on tokens (see #19236),
  -- which means the source spans will not be comparable and we will not
  -- be able to associate the HieAST with the correct tokens.
  --
  -- We work around this by setting the source span of the tokens to the file
  -- name from the HieAST
  let tokens = fmap (\tk -> tk{tkSpan = (tkSpan tk){srcSpanFile = srcSpanFile $ nodeSpan fullAst}}) tokens'

  -- Produce and write out the hyperlinked sources
  writeUtf8File path . renderToString pretty . render' fullAst $ tokens
  where
    dflags = ifaceDynFlags iface
    sDocContext = DynFlags.initSDocContext dflags Outputable.defaultUserStyle
    parserOpts =
      Lexer.mkParserOpts
        (dflags.extensionFlags)
        (initDiagOpts dflags)
        (safeImportsOn dflags)
        False -- lex Haddocks as comment tokens
        True -- produce comment tokens
        False -- produce position pragmas tokens
    render' = render (Just srcCssFile) (Just highlightScript) srcs
    path = srcdir </> hypSrcModuleFile (ifaceMod iface)

    emptyHieAst fileFs =
      Node
        { nodeSpan = realSrcLocSpan (mkRealSrcLoc fileFs 1 0)
        , nodeChildren = []
        , sourcedNodeInfo = SourcedNodeInfo mempty
        }
```

问题：

- 什么是 Interface？
  -
- 什么是 Hiefile ？
  - 一种 ghc 产生的中间文件，记录了一些必要的编译中间结果（如 AST 等等）。见 [ghc-wiki](https://gitlab.haskell.org/ghc/ghc-wiki-mirror/-/blob/master/hie-files.md)
- 什么是 `SrcMaps`


```haskell
  -- Produce and write out the hyperlinked sources
  writeUtf8File path . renderToString pretty . render' fullAst $ tokens
  where
    dflags = ifaceDynFlags iface
    sDocContext = DynFlags.initSDocContext dflags Outputable.defaultUserStyle
    parserOpts =
      Lexer.mkParserOpts
        (dflags.extensionFlags)
        (initDiagOpts dflags)
        (safeImportsOn dflags)
        False -- lex Haddocks as comment tokens
        True -- produce comment tokens
        False -- produce position pragmas tokens
    render' = render (Just srcCssFile) (Just highlightScript) srcs
    path = srcdir </> hypSrcModuleFile (ifaceMod iface)
```


可见，haddock 会首先拿到 `HieAST`, 然后把它和 `tokens`（经过源代码计算而来）送到 `render`

```haskell
-- | Produce the HTML corresponding to a hyperlinked Haskell source
render
  :: Maybe FilePath    -- ^ path to the CSS file
  -> Maybe FilePath    -- ^ path to the JS file
  -> SrcMaps            -- ^ Paths to sources
  -> HieAST PrintedType  -- ^ ASTs from @.hie@ files
  -> [Token]       -- ^ tokens to render
  -> Html
render mcss mjs srcs ast tokens = header mcss mjs <> body srcs ast tokens
```
